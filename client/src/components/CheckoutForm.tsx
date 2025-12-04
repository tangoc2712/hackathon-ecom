import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useNewOrderMutation } from '../redux/api/order.api';
import { useCreateZaloPayOrderMutation } from '../redux/api/payment.api';
import { resetCart } from '../redux/reducers/cart.reducer';
import { RootState } from '../redux/store';
import { notify } from '../utils/util';
import { NewOrderRequest } from '../types/api-types';
import BackButton from '../components/common/BackBtn';

// Define the CheckoutForm component
const CheckoutForm: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { user } = useSelector((state: RootState) => state.user);
  const {
    shippingInfo,
    cartItems,
    subTotal,
    tax,
    discount,
    shippingCharges,
    total,
  } = useSelector((state: RootState) => state.cart);

  const [newOrder] = useNewOrderMutation();

  const [createZaloPayOrder] = useCreateZaloPayOrderMutation();
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [paymentMethod, setPaymentMethod] = useState<'ZaloPay'>('ZaloPay');

  // Function to handle form submission
  const submitHandler = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (paymentMethod === 'ZaloPay') {
      setIsProcessing(true);
      try {
        const zaloPayItems = cartItems.map(item => ({
          itemid: item.productId,
          itemname: item.name,
          itemprice: Math.round(item.price * 25000),
          itemquantity: item.quantity
        }));

        if (tax > 0) {
          zaloPayItems.push({
            itemid: "tax",
            itemname: "Tax",
            itemprice: Math.round(tax * 25000),
            itemquantity: 1
          });
        }

        if (shippingCharges > 0) {
          zaloPayItems.push({
            itemid: "shipping",
            itemname: "Shipping Charges",
            itemprice: Math.round(shippingCharges * 25000),
            itemquantity: 1
          });
        }

        const zaloPayAmount = zaloPayItems.reduce((acc, item) => acc + (item.itemprice * item.itemquantity), 0);

        const res = await createZaloPayOrder({
          amount: zaloPayAmount,
          description: `Payment for order by ${user?.full_name || user?.displayName || user?.email}`,
          items: zaloPayItems,
          app_user: user?.user_id,
          shippingInfo,
          subTotal,
          tax,
          shippingCharges,
          total,
          orderItems: cartItems
        }).unwrap();

        if (res.returncode === 1) {
          // Redirect to ZaloPay
          window.location.href = res.orderurl;
        } else {
          console.error("ZaloPay Error Response:", res);
          notify(`ZaloPay Error: ${res.returnmessage} (${res.returncode})`, 'error');
          setIsProcessing(false);
        }
      } catch (error: any) {
        console.error("ZaloPay Request Error:", error);
        notify(error?.data?.message || error.message || 'ZaloPay Connection Error', 'error');
        setIsProcessing(false);
      }
      return;
    }
  };

  return (
    <>
      <div className="checkout-container flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">

        <div className="w-full max-w-lg m-4">
          <BackButton />
        </div>
        <form onSubmit={submitHandler} className="bg-white p-6 rounded-lg shadow-md max-w-lg w-full">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-blue-900">ShopSpot</h1>
          </div>
          <h2 className="text-2xl font-bold mb-4">Payment Details</h2>
          <div className="text-lg mb-4">
            <p>Total Amount: {cartItems.length > 0 ? cartItems[0].currency : '$'} {total.toFixed(2)}</p>
          </div>

          <div className="mb-6">
            <label className="block mb-2 font-semibold">Select Payment Method:</label>
            <div className="flex flex-col space-y-4">
              <label className={`cursor-pointer px-4 py-4 rounded border flex items-center justify-between ${paymentMethod === 'ZaloPay' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'border-gray-300 hover:bg-gray-50'}`}>
                <div className="flex items-center">
                  <input
                    type="radio"
                    value="ZaloPay"
                    checked={paymentMethod === 'ZaloPay'}
                    onChange={() => setPaymentMethod('ZaloPay')}
                    className="mr-3 h-4 w-4 text-blue-600"
                  />
                  <span className="font-semibold text-lg">ZaloPay Wallet</span>
                </div>
                <img
                  src="https://cdn.haitrieu.com/wp-content/uploads/2022/10/Logo-ZaloPay-Square.png"
                  alt="ZaloPay Logo"
                  className="h-10 w-10 object-contain"
                />
              </label>
            </div>
          </div>

          <div className="text-center mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-blue-800">You will be redirected to ZaloPay Gateway to complete your payment securely.</p>
          </div>

          <button type="submit" disabled={isProcessing} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-3 rounded-lg w-full transition duration-200">
            {isProcessing ? "Processing..." : `Pay with ZaloPay`}
          </button>

          <button
            type="button"
            className="bg-green-500 hover:bg-green-600 text-white font-bold px-4 py-3 rounded-lg w-full mt-4 transition duration-200"
            onClick={async () => {
              setIsProcessing(true);
              const orderData: NewOrderRequest = {
                shippingCharges,
                shippingInfo,
                tax,
                discount,
                total,
                subTotal,
                orderItems: cartItems,
                userId: user?.user_id,
              };
              try {
                const orderResponse = await newOrder(orderData);
                if (orderResponse.error) {
                  notify(`${orderResponse.error! || 'Failed to place order'}` as string, 'error');
                } else {
                  navigate("/my-orders");
                  setTimeout(() => {
                    dispatch(resetCart());
                  }, 1000);
                  notify('Order placed successfully (Bypass)', 'success');
                }
              } catch (e: any) {
                notify(e.message, 'error');
              } finally {
                setIsProcessing(false);
              }
            }}
          >
            Test Pay (Bypass ZaloPay)
          </button>
        </form>

        <div className="text-center mt-4 text-gray-500 text-sm">
          <p>Secure Payment by ZaloPay</p>
        </div>
      </div>
    </>
  );
};

export default CheckoutForm;
