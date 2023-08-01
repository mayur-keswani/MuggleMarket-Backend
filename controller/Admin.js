const Product = require("../modal/Product");
const Store = require("../modal/Store");
var cloudinary = require("cloudinary").v2;
const deleteFile = require("../utils/deleteFileHelper");

cloudinary.config({
  cloud_name: "dra5wny0w",
  api_key: "547648178774378",
  api_secret: "41kiA96ypoOYXbN3cR41VAWC2fg",
});

const cloudinaryUploader = async (path) => {
  let imageURL = "";
  await cloudinary.uploader.upload(path, (error, result) => {
    if (error) {
      console.log({ error });
      throw new Error(error);
    }
    imageURL = result.url;
  });
  return imageURL;
};
const createStore = async (req, res, next) => {
  try {
    let imageURL;
    if (req.file) {
      imageURL = await cloudinaryUploader(req.file.path);
    }
    let {
      name,
      description,
      city,
      address,
      openingTime,
      closingTime,
      contactNo,
      landlineNo,
      ownerName,
      personalNo,
      storeType,
      yearOfEstablishment,
      site,
      facebook,
      instagram,
      youtube,
    } = req.body;

    let payload = {
      owner: req.user,
      name,
      description,
      location: { city, address },
      openingTime,
      closingTime,
      contactNo,
      landlineNo,
      ownerName,
      personalNo,
      storeType,
      yearOfEstablishment,
      social: { site, facebook, instagram, youtube },
      picture: imageURL,
    };
    let store = new Store(payload);
    let response = await store.save();
    deleteFile(req.file.path);

    // const user = User.findById(req.user);
    // user.storeID.push(store._id);
    // await user.save();

    return res
      .status(201)
      .json({ message: "Store created successfully", store: response });
  } catch (error) {
    if (!error.statusCode) {
      error.statusCode = 500;
    }
    console.log(error);
    next(error);
  }
};

const updateStore = async (req, res, next) => {
  let id = req.params.id;
  try {
    let imageURL = "";
    if (req.file) {
      imageURL = await cloudinaryUploader(req.file.path);
    }
    let store = await Store.findById(id);
    if (store) {
      let {
        name,
        description,
        city,
        address,
        openingTime,
        closingTime,
        contactNo,
        landlineNo,
        ownerName,
        personalNo,
        storeType,
        yearOfEstablish,
        site,
        facebook,
        instagram,
        youtube,
        picture,
      } = req.body;

      if (store.owner.toString() === req.user.toString()) {
        store.name = name;
        store.description = description;
        store.location = { city, address };
        store.openingTime = openingTime;
        store.closingTime = closingTime;
        store.contactNo = contactNo;
        store.landlineNo = landlineNo;
        store.ownerName = ownerName;
        store.personalNo = personalNo;
        store.storeType = storeType;
        store.yearOfEstablish = yearOfEstablish;
        store.social = { site, facebook, instagram, youtube };

        if (imageURL) {
          store.picture = imageURL;
        }

        let response = await store.save();

        return res
          .status(201)
          .json({ store: response, message: "Store Update Successfully" });
      } else {
        let error = new Error("You are not authorized to edit store details");
        error.statusCode = 401;
        throw new Error(error);
      }
    } else {
      let error = new Error("Store not found!");
      error.statusCode = 404;
      throw new Error(error);
    }
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

const getMyStores = async (req, res, next) => {
  try {
    const stores = await Store.find({ owner: req.user });
    if (stores.length == 0) {
      const error = new Error("No Stores Found !");
      error.statusCode = 404;
      throw error;
    }
    return res.status(200).json({ stores: stores });
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;

    next(error);
  }
};

const getMyStoreDetails = async (req, res, next) => {
  Store.findById(req.params.id)
    .then((store) => {
      if (!store) {
        let error = new Error("No Store Found");
        error.statusCode = 404;
        throw error;
      } else {
        res.status(200).json({ store: store });
      }
    })
    .catch((error) => {
      if (!error.statusCode) {
        error.statusCode = 500;
      }
      next(error);
    });
};

const getMyStoreProducts = async (req, res, next) => {
  const storeId = req.params.id;
  const store = await Store.findById(storeId);
  const { name, description, picture, price } = req.body;
  try {
    if (store.user === req.user) {
      const product = new Product({
        storeId,
        name,
        description,
        picture,
        price,
        filterType,
      });
      const response = await product.save();
      res.json({ product: response });
    } else {
      const error = new Error("Not Allowed!");
      error.statusCode = 401;
      throw new Error(error);
    }
  } catch (error) {
    return next(error);
  }
};

const getMyStoreCategories = async (req, res, next) => {
  const storeId = req.params.id;
  try {
    const store = await Store.findById(storeId);
    if (store) res.json({ categories: store.categories });
    else {
      const error = new Error("Not Found");
      error.statusCode = 404;
    }
  } catch (error) {
    return next(error);
  }
};

const postMyStoreCategory = async (req, res, next) => {
  const storeId = req.params.id;
  try {
    const store = await Store.findById(storeId);
    if (store.owner.toString() == req.user.toString()) {
      const { name, description } = req.body;
      store.categories = store.categories.concat({ name, description });
      const result = await store.save();

      return res.json({ categories: result.categories });
    } else {
      const error = new Error("Not Allowed!");
      error.statusCode = 401;
      throw new Error(error);
    }
  } catch (error) {
    return next(error);
  }
};

const deleteMyStoreCategory = async (req, res, next) => {
  const storeId = req.params.id;
  const categoryId = req.params.categoryId;

  try {
    const store = await Store.findById(storeId);
    if (store.owner.toString() == req.user.toString()) {
      const categoryIndex = store.categories.findIndex(
        (category) => category._id.toString() == categoryId.toString()
      );

      // Check if the cart item exists
      if (categoryIndex === -1) {
        return res.status(404).json({ error: "Category not found" });
      }
      // Remove the cart item from the user's cart array
      store.categories.splice(categoryIndex, 1);
      const result = await store.save();
      return res.json({ categories: result.categories });
    } else {
      const error = new Error("Not Allowed!");
      error.statusCode = 401;
      throw new Error(error);
    }
  } catch (error) {
    return next(error);
  }
};

const postMyStoreProduct = async (req, res, next) => {
  const storeID = req.params.id;

  try {
    const store = await Store.findById(storeID);
    const { name, description, picture, price, categories } = req.body;
    if (store.owner.toString() == req.user.toString()) {
      const productImageURL = await cloudinaryUploader(req.file.path);
      const product = new Product({
        storeID,
        name,
        description,
        picture: productImageURL,
        price,
        categories,
      });
      const response = await product.save();
      res.json({ product: response });
    } else {
      const error = new Error("Not Allowed!");
      error.statusCode = 401;
      throw new Error(error);
    }
  } catch (error) {
    return next(error);
  }
};

const updateMyStoreProduct = async (req, res, next) => {
  const storeID = req.params.id;
  const productId = req.params.productId;

  try {
    const store = await Store.findById(storeID);
    const { name, description, picture, price, categories } = req.body;
    if (store.owner.toString() == req.user.toString()) {
      const product = await Product.findById(productId);
      if (product) {
        let url;
        if (req.file) {
          url = await cloudinaryUploader(req.file.path);
        } else {
          url = picture;
        }
        product.name = name;
        product.description = description;
        product.picture = url;
        product.price = price;
        product.categories = categories;
        const response = await product.save();
        res.json({ product: response });
      } else {
        const error = new Error("Product not Found!");
        error.statusCode = 404;
        throw new Error(error);
      }
    } else {
      const error = new Error("Not Allowed!");
      error.statusCode = 401;
      throw new Error(error);
    }
  } catch (error) {
    return next(error);
  }
};

const deleteMyStoreProduct = async (req, res, next) => {
  const storeId = req.params.id;
  const productId = req.params.productId;

  try {
    const store = await Store.findById(storeId);
    if (store.owner.toString() == req.user.toString()) {
      const product = await Product.findByIdAndDelete(productId);
      return res.json({ product });
    } else {
      const error = new Error("Not Allowed!");
      error.statusCode = 401;
      throw new Error(error);
    }
  } catch (error) {
    return next(error);
  }
};

const deleteStore = async (req, res, next) => {
  const storeId = req.params.id;
  try {
    const store = await Store.findById(storeId);

    if (store && store.owner == req.user) {
      const response = await Store.findByIdAndDelete(storeId);
      res.status(204).json({ response });
    } else {
      const error = new Error("Not Allowed!");
      error.statusCode = 401;
      throw new Error(error);
    }
  } catch (error) {
    next(error);
  }
};

const updateMyStoreCategory = async (req, res, next) => {
  const storeID = req.params.id;
  const categoryId = req.params.categoryId;

  try {
    const store = await Store.findById(storeID);
    const { name, description } = req.body;
    if (store.owner.toString() == req.user.toString()) {
      let updatingCategoryIndex = store.categories.findIndex(
        (category) => category._id.toString() == categoryId.toString()
      );
      if (updatingCategoryIndex !== -1) {
        store.categories[updatingCategoryIndex].name = name;
        store.categories[updatingCategoryIndex].description = description;
        const response = await store.save();
        res.json({ categories: response.categories });
      } else {
        const error = new Error("Category not Found!");
        error.statusCode = 404;
        throw new Error(error);
      }
    } else {
      const error = new Error("Not Allowed!");
      error.statusCode = 401;
      throw new Error(error);
    }
  } catch (error) {
    return next(error);
  }
};
module.exports = {
  createStore,
  updateStore,
  getMyStores,
  getMyStoreDetails,
  getMyStoreProducts,
  postMyStoreProduct,
  getMyStoreCategories,
  postMyStoreCategory,
  updateMyStoreCategory,
  deleteMyStoreCategory,
  deleteMyStoreProduct,
  updateMyStoreProduct,
  deleteStore,
};
