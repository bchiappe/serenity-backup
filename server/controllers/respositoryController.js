const Repository = require("../models/repository");
const mongoose = require("mongoose");
const paginate = require("express-paginate");
const { encrypt } = require("../services/encryption");

// Get repositories
exports.getAll = async (req, res) => {
  try {
    const [results, itemCount] = await Promise.all([
      Repository.find().limit(req.query.limit).skip(req.skip).lean().exec(),
      Repository.count(),
    ]);
    const pageCount = Math.ceil(itemCount / req.query.limit);
    return res.status(200).json({
      count: itemCount,
      pages: pageCount,
      hasMore: paginate.hasNextPages(req)(pageCount),
      items: results,
    });
  } catch (err) {
    console.log("Failed to get repositories", err.message);
    return res
      .status(500)
      .send(
        "An error occurred getting the repositories. Please try again later."
      );
  }
};

// Get repository
exports.get = async (req, res) => {
  try {
    const user = await Repository.findById(req.params.id).lean().exec();
    return res.status(200).json(user);
  } catch (err) {
    console.log("Failed to get repository", err.message);
    return res
      .status(500)
      .send(
        "An error occurred getting the repository. Please try again later."
      );
  }
};

// Add repository
exports.create = async (req, res) => {
  try {
    // // Encrypt password
    // const password = await encrypt(req.body.password);
    // Attempt to insert repository into database
    const repository = await Repository.create({
      ...req.body,
      // password: password,
    });
    // Check for validation error
    if (repository instanceof mongoose.Error.ValidationError) {
      return res.status(400).json(repository);
    } else {
      // Return new repository
      return res.status(200).json(repository);
    }
  } catch (err) {
    console.log("Failed to create repository", err.message);
    return res
      .status(500)
      .send(
        "An error occurred creating the repository. Please try again later."
      );
  }
};

// Update repository
exports.update = async (req, res) => {
  try {
    const data = { ...req.body };
    // // Encrypt password (if needed)
    // if ("password" in data) {
    //   data.password = await encrypt(data.password);
    // }
    const repository = await Repository.findByIdAndUpdate(req.params.id, data);
    // Check for validation error
    if (repository instanceof mongoose.Error.ValidationError) {
      return res.status(400).json(repository);
    } else {
      // Return new repository
      return res.status(200).json(repository);
    }
  } catch (err) {
    console.log("Failed to update repository", err.message);
    return res
      .status(500)
      .send(
        "An error occurred updating the repository. Please try again later."
      );
  }
};

// Delete repository
exports.delete = async (req, res) => {
  try {
    await Repository.findByIdAndDelete(req.params.id);
    // Return no content
    return res.status(204).send();
  } catch (err) {
    console.log("Failed to delete repository", err.message);
    return res
      .status(500)
      .send(
        "An error occurred deleting the repository. Please try again later."
      );
  }
};
