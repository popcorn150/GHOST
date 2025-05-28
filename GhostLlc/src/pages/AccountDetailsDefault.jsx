import { useOutletContext } from "react-router-dom";
import { Toaster } from "sonner";

const AccountDetailsDefault = () => {
  const {
    account,
    isPurchased,
    renderCredentials,
    handleAddToCart,
    handlePurchase,
    isInCart,
    // currentUser
  } = useOutletContext();

  return (
    <>
      <p className="text-gray-300 text-sm sm:text-base">{account.details}</p>

      {account.accountWorth && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold text-[#0576FF]">
            Account Worth
          </h3>
          <p className="text-xl text-[#0576FF]">${account.accountWorth}</p>
        </div>
      )}

      {renderCredentials()}

      {account.createdAt && (
        <div className="mt-6">
          <p className="text-gray-400 text-sm">
            Listed on{" "}
            {new Date(
              account.createdAt.seconds
                ? account.createdAt.seconds * 1000
                : account.createdAt
            ).toLocaleDateString()}
          </p>
        </div>
      )}

      <div className="flex flex-col sm:flex-row justify-end gap-3 mt-6">
        <Toaster richColors position="top-center" />
        <button
          onClick={handleAddToCart}
          disabled={isInCart}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200
            ${
              isInCart
                ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-gray-700 text-blue-300 border border-blue-500/30 hover:bg-gray-600 hover:border-blue-400"
            }`}
          aria-label={isInCart ? "Item in cart" : "Add to cart"}
        >
          {isInCart ? (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>In Cart</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                />
              </svg>
              <span>Add to Cart</span>
            </>
          )}
        </button>
        <button
          onClick={handlePurchase}
          disabled={isPurchased}
          className={`flex items-center justify-center gap-2 w-full sm:w-auto px-5 py-2.5 rounded-md text-sm font-medium transition-all duration-200
            ${
              isPurchased
                ? "bg-gray-800 text-gray-400 cursor-not-allowed"
                : "bg-[#0576FF] text-white hover:bg-[#0465db]"
            }`}
          aria-label={isPurchased ? "Purchased" : "Purchase account"}
        >
          {isPurchased ? (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Purchased</span>
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
              <span>Purchase</span>
            </>
          )}
        </button>
      </div>
    </>
  );
};

export default AccountDetailsDefault;
