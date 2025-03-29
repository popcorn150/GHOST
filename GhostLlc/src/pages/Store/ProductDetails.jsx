import "../../App.css"
import { useState } from "react";
import { Link, useParams } from "react-router-dom"
import NavBar from "../../components/NavBar";
import flashSalesProducts from "./flashSalesProducts";
import { TbRectangleVerticalFilled } from "react-icons/tb";
import otherProducts from "./otherProducts";

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
      <div className="min-h-screen text-white p-6 grid max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row gap-10">
          {/* Left Side - Image Gallery */}
          <div className="flex gap-10">
            {product.screenShots && product.screenShots.length > 0 && (
              <div className="flex flex-col gap-2">
                {
                  product.screenShots.map((img) => (
                    <img
                      key={img.id}
                      src={img.img}
                      alt="Product Thumbnail"
                      className={`w-80 lg:w-24 lg:h-24 object-cover rounded cursor-pointer border-2 ${mainImage === img ? "border-red-500" : "border-transparent"
                        }`}
                      onClick={() => setMainImage(img.img)}
                    />
                  ))
                }
              </div>
            )}
            <img src={mainImage} alt="Main Product" className="w-96 h-96 object-cover rounded" />
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
                    className={`px-3 py-1 border rounded cursor-pointer ${selectedSize === size ? "bg-red-500 text-white" : "border-gray-500 text-gray-300"
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
                className="px-3 py-2 bg-ray-700 rounded border border-gray-500 cursor-pointer"
              >
                -
              </button>
              <span>{quantity}</span>
              <button
                onClick={() => setQuantity((prev) => prev + 1)}
                className="px-3 py-2 bg-ray-700 rounded border border-gray-500"
              >
                +
              </button>
            </div>

            {/* Buy Now Button */}
            <button
              onClick={() => { alert(`${quantity} ${product.name} purchased successfully!`) }}
              className="bg-red-500 text-white px-6 py-3 rounded font-bold cursor-pointer">
              Buy Now
            </button>
          </div>
        </div>

        <div className="w-full max-w-7xl mt-10 px-5">
          {/* Other Products */}
          <div className="w-full flex justify-start my-2 gap-2">
            <TbRectangleVerticalFilled className="text-red-500 self-center w-7 h-7" />
            <h3 className="text-red-500 text-base font-medium self-center">Other Products</h3>
          </div>

          <div className="flex overflow-x-auto space-x-4 no-scrollbar">
            {otherProducts.map((product, id) => (
              <>
                <Link to={`/more-product/${product.slug}`} className="cursor-pointer">
                  <div
                    key={id}
                    className="min-w-[280px] text-black p-4 rounded-lg shadow-lg"
                  >
                    <img src={product.image} alt={product.name} className="w-full h-44 object-cover rounded" />
                    <h3 className="mt-2 text-sm text-white font-medium">
                      {product.name}
                    </h3>
                    <div className="max-w-fit my-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
                      {product.views} views
                    </div>
                    <p className="text-xs text-gray-500">
                      ⭐ {product.rating} reviews
                    </p>
                  </div>
                </Link>
              </>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

export default ProductDetails