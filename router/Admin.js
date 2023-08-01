const express = require("express");
const router = express.Router();
const isAuth = require("../middleware/isAuth");
const Product = require("../modal/Product");
const {
  createStore,
  updateStore,
  getMyStoreCategories,
  postMyStoreCategory,
  deleteMyStoreCategory,
  postMyStoreProduct,
  getMyStores,
  getMyStoreDetails,
  getMyStoreProducts,
  deleteMyStoreProduct,
  updateMyStoreProduct,
  deleteStore,
  updateMyStoreCategory,
} = require("../controller/Admin");

router.post("/store", isAuth, createStore);
router.put("/store/:id", isAuth, updateStore);
router.delete("/store/:id", isAuth, deleteStore);


/** My Store 'Categories & Products */
router.get("/my-stores", isAuth, getMyStores);
router.get("/my-store/:id", isAuth, getMyStoreDetails);
router.get("/my-stores/:id/categories", isAuth, getMyStoreCategories);
router.post("/my-stores/:id/categories", isAuth, postMyStoreCategory);
router.put(
  "/my-stores/:id/categories/:categoryId",
  isAuth,
  updateMyStoreCategory
);
router.delete(
  "/my-stores/:id/categories/:categoryId",
  isAuth,
  deleteMyStoreCategory
);
router.get("/my-stores/:id/products", isAuth,getMyStoreProducts);
router.post("/my-stores/:id/products", isAuth, postMyStoreProduct);
router.delete(
  "/my-stores/:id/products/:productId",
  isAuth,
  deleteMyStoreProduct
);
router.put("/my-stores/:id/products/:productId", isAuth, updateMyStoreProduct);


module.exports = router;
