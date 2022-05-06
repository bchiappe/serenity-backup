const { NodeSSH } = require("node-ssh");
const Backup = require("../models/backup");
const Host = require("../models/host");
const Repository = require("../models/repository");
const Snapshot = require("../models/snapshot");
const Activity = require("../models/activity");
const { decrypt } = require("./encryption");
const { Decimal128 } = require("mongodb");

class BackupService {
  constructor() {
    this.ssh = new NodeSSH();
    this.vars = {};
  }

  async connect(hostId) {
    // Look up host
    this.host = await Host.findById(hostId);
    // Attempt ssh connection
    this.ssh = new NodeSSH();
    try {
      await this.ssh.connect({
        host: this.host.host,
        port: this.host.port,
        username: this.host.username,
        password: decrypt(this.host.password),
      });
      // Update last connection
      this.host.lastConnection = {
        result: "success",
        date: Date.now(),
      };
      await this.host.save();
    } catch (err) {
      console.error("Failed to connect to host", err.message);
      // Update last connection
      this.host.lastConnection = {
        result: "fail",
        date: Date.now(),
      };
      await this.host.save();
      throw Error(`Failed to connect to host: ${err.message}`);
    }
  }

  async checkVersion() {
    const response = await this.ssh.execCommand("restic version");
    if (response.stdout.startsWith("restic")) {
      const version = response.stdout;
      this.host.resticVersion = version.split(" ")[1];
      await this.host.save();
      return this.host.resticVersion;
    } else {
      throw Error(`Received unexpected response. Is restic installed?`);
    }
  }

  setEnvVar(key, val) {
    this.vars[key] = val;
  }

  getEnvVars() {
    const exports = [];
    for (const [key, val] of Object.entries(this.vars)) {
      if (this.host.os === "windows") {
        exports.push(`$Env:${key}='${val}'`);
      } else {
        exports.push(`export ${key}=${val}`);
      }
    }
    if (this.host.os === "windows") {
      return `powershell; ${exports.join("; ")}`;
    } else {
      return exports.join(";");
    }
  }

  async addSnapshot(summary) {
    const snapshot = await Snapshot.create({
      backup: this.backup._id,
      host: this.backup.host._id,
      repository: this.backup.repository._id,
      identifier: summary.snapshot_id,
      filesNew: summary.files_new,
      filesChanged: summary.files_changed,
      filesUnmodified: summary.files_unmodified,
      dirNew: summary.dirs_new,
      dirChanged: summary.dirs_changed,
      dirUnmodified: summary.dirs_unmodified,
      dataAdded: summary.data_added,
      totalFilesProcessed: summary.total_files_processed,
      totalBytesProcessed: summary.total_bytes_processed,
      totalDuration: Decimal128.fromString(summary.total_duration),
    });
    return snapshot;
  }

  async removeSnapshot() {
    await Snapshot.findByIdAndDelete(this.snapshot._id);
  }

  async createActivity(details) {
    console.log("Create Activity", details);
    const activity = await Activity.create({
      backup: this.backup._id,
      host: this.backup.host._id,
      repository: this.backup.repository._id,
      ...details,
    });
    this.activity = activity;
  }

  async updateActivity(progress, status = null) {
    console.log("Update Activity", progress, status);
    const updates = {
      progress: progress,
    };
    if (status !== null) {
      updates.status = status;
    }
    this.activity = await Activity.findOneAndUpdate(
      { _id: this.activity._id },
      updates
    );
  }

  async addActivityMessage(message) {
    console.log("Add Activity Message", message);
    await Activity.findOneAndUpdate(
      { _id: this.activity._id },
      { $addToSet: { messages: message } }
    );
  }

  async updateLastRun(result) {
    await Backup.findOneAndUpdate(
      { _id: this.backup._id },
      {
        lastRun: {
          result: result,
          date: Date.now(),
        },
      }
    );
  }

  async backup(backupId) {
    // Look up backup
    this.backup = await Backup.findById(backupId)
      .populate("host")
      .populate("repository");
    await this.createActivity({ status: "Running" });
    await this.addActivityMessage({ message: "Started backup" });
    let progress = 0;
    // Attempt to connect to host
    await this.connect(this.backup.host._id);
    // Check version
    await this.checkVersion();
    // Handle repo type
    const repo = this.backup.repository;
    const repoType = repo.type;
    let command;
    switch (repoType) {
      case "s3": {
        progress = 10;
        await this.updateActivity(progress);
        await this.addActivityMessage({ message: "Backing up to S3" });
        // Set environment variables
        this.setEnvVar("AWS_ACCESS_KEY_ID", repo.accessKeyId);
        this.setEnvVar("AWS_SECRET_ACCESS_KEY", repo.secretAccessKey);
        this.setEnvVar("RESTIC_PASSWORD", repo.password);
        // Set command
        if (this.host.os === "windows") {
          command = `${this.getEnvVars()}; restic -r s3:${repo.host}:${
            repo.port
          }/restic backup '${this.backup.path}' --json;\r\n`;
        } else {
          command = `${this.getEnvVars()}; restic -r s3:${repo.host}:${
            repo.port
          }/restic backup "${this.backup.path}" --json`;
        }
        break;
      }
      case "b2": {
        await this.addActivityMessage({
          message: "Backing up to Backblaze B2",
        });
        // Set environment variables
        this.setEnvVar("B2_ACCOUNT_ID", repo.accountId);
        this.setEnvVar("B2_ACCOUNT_KEY", repo.accountKey);
        this.setEnvVar("RESTIC_PASSWORD", repo.password);
        // Set command
        command = `${this.getEnvVars()}; restic -r b2:${repo.bucketName}:${
          repo.path
        } backup "${this.backup.path}" --json`;
        break;
      }
      default:
        throw Error(`Cannot handle repository of type ${repoType}`);
    }
    // Run backup
    console.log("Command", command);
    this.ssh.execCommand(command, {
      onStdout: async (chunk) => {
        const output = chunk.toString("utf8");
        await this.addActivityMessage({
          message: output,
          level: "debug",
        });
        try {
          const parsed = JSON.parse(output, (key, val) =>
            key === "total_duration" ? String(val) : val
          );
          if (parsed.message_type === "status") {
            progress = Math.round(parsed.percent_done * 100);
            await this.updateActivity(progress);
          }
          if (parsed.message_type === "summary") {
            console.log("Total Duration", parsed.total_duration);
            // Add snapshot
            await this.addSnapshot(parsed);
            // Update last run
            await this.updateLastRun("success");
            await this.addActivityMessage({ message: "Backup complete" });
            await this.updateActivity(100, "Complete");
          }
        } catch (err) {
          console.log("Invalid JSON", err.message);
        }
      },
      onStderr: async (chunk) => {
        const output = chunk.toString("utf8");
        await this.addActivityMessage({
          message: output,
          level: "error",
        });
        await this.updateActivity(progress, "Error");
        // Update last run
        await this.updateLastRun("fail");
      },
    });
  }

  async purge(snapshotId) {
    // Look up snapshot
    this.snapshot = await Snapshot.findById(snapshotId)
      .populate("host")
      .populate("repository");
    // Look up backup
    this.backup = await Backup.findById(this.snapshot.backup)
      .populate("host")
      .populate("repository");
    // Log activity
    await this.createActivity({ status: "Running", type: "Purge" });
    await this.addActivityMessage({ message: "Started purge" });
    let progress = 0;
    // Attempt to connect to host
    await this.connect(this.backup.host._id);
    // Check version
    await this.checkVersion();
    // Handle repo type
    const repo = this.backup.repository;
    const repoType = repo.type;
    switch (repoType) {
      case "s3": {
        progress = 10;
        await this.updateActivity(progress);
        await this.addActivityMessage({ message: "Purging snapshot from S3" });
        // Set environment variables
        this.setEnvVar("AWS_ACCESS_KEY_ID", repo.accessKeyId);
        this.setEnvVar("AWS_SECRET_ACCESS_KEY", repo.secretAccessKey);
        this.setEnvVar("RESTIC_PASSWORD", repo.password);
        // Purge snapshot
        try {
          const result = await this.ssh.execCommand(
            `${this.getEnvVars()}; restic -r s3:${repo.host}:${
              repo.port
            }/restic forget ${this.snapshot.identifier} --json`
          );
          if (result.code === 0) {
            // Remove snapshot
            await this.removeSnapshot();
            await this.addActivityMessage({
              message: result.stdout,
              level: "debug",
            });
            await this.addActivityMessage({ message: "Purge complete" });
            await this.updateActivity(100, "Complete");
          } else {
            await this.addActivityMessage({
              message: result.stderr,
              level: "error",
            });
            await this.updateActivity(progress, "Error");
          }
        } catch (err) {
          await this.addActivityMessage({
            message: err.message,
            level: "error",
          });
          await this.updateActivity(progress, "Error");
        }
        return;
      }
      case "b2": {
        await this.addActivityMessage({
          message: "Purging from Backblaze B2",
        });
        // Set environment variables
        this.setEnvVar("B2_ACCOUNT_ID", repo.accountId);
        this.setEnvVar("B2_ACCOUNT_KEY", repo.accountKey);
        this.setEnvVar("RESTIC_PASSWORD", repo.password);
        // Purge snapshot
        try {
          const result = await this.ssh.execCommand(
            `${this.getEnvVars()}; restic -r b2:${repo.bucketName}:${
              repo.path
            }/restic forget ${this.snapshot.identifier} --json`
          );
          if (result.code === 0) {
            // Remove snapshot
            await this.removeSnapshot();
            await this.addActivityMessage({
              message: result.stdout,
              level: "debug",
            });
            await this.addActivityMessage({ message: "Purge complete" });
            await this.updateActivity(100, "Complete");
          } else {
            await this.addActivityMessage({
              message: result.stderr,
              level: "error",
            });
            await this.updateActivity(progress, "Error");
          }
        } catch (err) {
          await this.addActivityMessage({
            message: err.message,
            level: "error",
          });
          await this.updateActivity(progress, "Error");
        }
        return;
      }
      default:
        throw Error(`Cannot handle repository of type ${repoType}`);
    }
  }

  async listSnapshotFiles(snapshotId, path) {
    // Look up snapshot
    this.snapshot = await Snapshot.findById(snapshotId)
      .populate("host")
      .populate("repository");
    // Look up backup
    this.backup = await Backup.findById(this.snapshot.backup)
      .populate("host")
      .populate("repository");
    // Attempt to connect to host
    await this.connect(this.backup.host._id);
    // Check version
    await this.checkVersion();
    // Handle repo type
    const repo = this.backup.repository;
    const repoType = repo.type;
    let command;
    switch (repoType) {
      case "s3": {
        // Set environment variables
        this.setEnvVar("AWS_ACCESS_KEY_ID", repo.accessKeyId);
        this.setEnvVar("AWS_SECRET_ACCESS_KEY", repo.secretAccessKey);
        this.setEnvVar("RESTIC_PASSWORD", repo.password);
        // Set command
        command = `${this.getEnvVars()}; restic -r s3:${repo.host}:${
          repo.port
        }/restic ls ${this.snapshot.identifier} ${path} --json`;
        break;
      }
      case "b2": {
        // Set environment variables
        this.setEnvVar("B2_ACCOUNT_ID", repo.accountId);
        this.setEnvVar("B2_ACCOUNT_KEY", repo.accountKey);
        this.setEnvVar("RESTIC_PASSWORD", repo.password);
        // Set command
        command = `${this.getEnvVars()}; restic -r b2:${repo.bucketName}:${
          repo.path
        }/restic ls ${this.snapshot.identifier} ${path} --json`;
        break;
      }
      default:
        throw Error(`Cannot handle repository of type ${repoType}`);
    }
    // Execute command on host
    try {
      console.log("Command", command);
      const result = await this.ssh.execCommand(command);
      if (result.code === 0) {
        // Split stdout by linebreak
        const lines = String(result.stdout).split("\n");
        // Remove first info message
        lines.shift();
        // Parse each line and add to array
        const output = [];
        for (const line of lines) {
          output.push(JSON.parse(line));
        }
        // Return parsed output
        return output;
      } else {
        throw Error(`Unable to get snapshot files: ${result.stderr}`);
      }
    } catch (err) {
      throw Error(`Unable to get snapshot files: ${err.message}`);
    }
  }

  async restoreSnapshotFile(snapshotId, file) {
    // Look up snapshot
    this.snapshot = await Snapshot.findById(snapshotId)
      .populate("host")
      .populate("repository");
    // Look up backup
    this.backup = await Backup.findById(this.snapshot.backup)
      .populate("host")
      .populate("repository");
    // Log activity
    await this.createActivity({ status: "Running", type: "Restore" });
    await this.addActivityMessage({
      message: `Started restore of file ${file}`,
    });
    let progress = 0;
    // Attempt to connect to host
    await this.connect(this.backup.host._id);
    // Check version
    await this.checkVersion();
    // Handle repo type
    const repo = this.backup.repository;
    const repoType = repo.type;
    let command;
    switch (repoType) {
      case "s3": {
        progress = 10;
        await this.updateActivity(progress);
        await this.addActivityMessage({ message: "Restoring from S3" });
        // Set environment variables
        this.setEnvVar("AWS_ACCESS_KEY_ID", repo.accessKeyId);
        this.setEnvVar("AWS_SECRET_ACCESS_KEY", repo.secretAccessKey);
        this.setEnvVar("RESTIC_PASSWORD", repo.password);
        // Set command
        command = `sudo sh -c "${this.getEnvVars()}; restic -r s3:${
          repo.host
        }:${repo.port}/restic restore ${
          this.snapshot.identifier
        } --target / --include ${file} --json"`;
        break;
      }
      case "b2": {
        progress = 10;
        await this.updateActivity(progress);
        await this.addActivityMessage({ message: "Restoring from B2" });
        // Set environment variables
        this.setEnvVar("B2_ACCOUNT_ID", repo.accountId);
        this.setEnvVar("B2_ACCOUNT_KEY", repo.accountKey);
        this.setEnvVar("RESTIC_PASSWORD", repo.password);
        // Set command
        command = `sudo sh -c "${this.getEnvVars()}; restic -r b2:${
          repo.bucketName
        }:${repo.path}/restic restore ${
          this.snapshot.identifier
        } --target / --include ${file} --json"`;
        break;
      }
      default:
        throw Error(`Cannot handle repository of type ${repoType}`);
    }
    // Execute command on host
    console.log("Command", command);
    const decrypted = decrypt(this.host.password);
    this.ssh
      .execCommand(command, {
        execOptions: { pty: true },
        stdin: `${decrypted}\n`,
        onStdout: async (chunk) => {
          let output = chunk.toString("utf8");
          output = output.replace(decrypted, "**HIDDEN**");
          await this.addActivityMessage({
            message: output,
            level: "debug",
          });
        },
        onStderr: async (chunk) => {
          let output = chunk.toString("utf8");
          output = output.replace(decrypted, "**HIDDEN**");
          await this.addActivityMessage({
            message: output,
            level: "error",
          });
          await this.updateActivity(progress, "Error");
        },
      })
      .then(async (result) => {
        if (result.code === 0) {
          await this.addActivityMessage({ message: "Restore complete" });
          await this.updateActivity(100, "Complete");
        } else {
          await this.updateActivity(progress, "Error");
        }
      });
  }
}

module.exports = BackupService;
