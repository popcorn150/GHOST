import { useParams } from "react-router-dom"
import NavBar from "../../components/NavBar";
import flashSalesProducts from "./flashSalesProducts";
import { useState } from "react";

const ProductDetails = () => {
  const [selectedSize, setSelectedSize] = useState("M");
  const [quantity, setQuantity] = useState(1);

  const { slug } = useParams();
  const product = flashSalesProducts.find((item) => item.slug === slug);

  const [mainImage, setMainImage] = useState(product?.screenShots?.[0]?.img || product?.image);

  if (!product) {
    return <div className="text-center text-red-500">Product not found</div>
  }


  return (
    <>
      <NavBar />
      <div className="min-h-screen text-white p-6 flex flex-col md:flex-row gap-8 max-w-6xl mx-auto">
        {/* Left Side - Image Gallery */}
        <div className="flex gap-4">
          {product.screenShots && product.screenShots.length > 0 && (
            <div className="flex flex-col gap-2">
              {
                product.screenShots.map((img) => (
                  <img
                    key={img.id}
                    src={img.img}
                    alt="Product Thumbnail"
                    className={`w-32 h-32 object-cover rounded cursor-pointer border-2 ${mainImage === img ? "border-red-500" : "border-transparent"
                      }`}
                    onClick={() => setMainImage(img.img)}
                  />
                ))
              }
            </div>
          )}
          <img src={mainImage} alt="Main Product" className="w-[535px] h-[535px] object-cover rounded" />
        </div>

        {/* Right Side - Product Info */}
        <div className="flex flex-col space-y-4 w-full max-w-lg">
          <h1 className="text-2xl font-bold">
            {product.name}
          </h1>
          <p className="text-gray-500 text-xs">
            ⭐ ({product.rating} Reviews)
          </p>
          <p className="text-gray-300 text-base">
            {product.info}
          </p>

          {/* Size Selector */}
          <div>
            <p className="text-gray-400 mb-2">
              Size:
            </p>
            <div className="flex gap-2">
              {["XS", "S", "M", "L", "XL"].map((size) => (
                <button
                  key={size}
                  onClick={() => setSelectedSize(size)}
                  className={`px-3 py-1 border rounded ${selectedSize === size ? "bg-red-500 text-white" : "border-gray-500 text-gray-300"
                    }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              className="px-3 py-2 bg-ray-700 rounded"
            >
              -
            </button>
            <span>{quantity}</span>
            <button
              onClick={() => setQuantity((prev) => prev + 1)}
              className="px-3 py-2 bg-ray-700 rounded"
            >
              +
            </button>
          </div>

          {/* Buy Now Button */}
          <button
            onClick={() => { alert("Product added to cart!") }}
            className="bg-red-500 text-white px-6 py-3 rounded font-bold cursor-pointer">
            Buy Now
          </button>
        </div>
      </div>
    </>
  )
}

export default ProductDetails