import NavBar from "../components/NavBar";

const Cart = () => {
  return (
    <>
    <NavBar />
    <div className="p-5">
        <h1 className="text-white text-center">You currently have no accounts added to cart!</h1>
    </div>
    </>
  )
}

export default Cart