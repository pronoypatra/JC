import React, { useState } from 'react';
import itemsData from './items.json'; // Import JSON data
import axios from "axios"


const ItemList = () => {
    const [items, setItems] = useState(itemsData);
    const [totalPrice, setTotalPrice] = useState('');
    const [orderId, setOrderId] = useState(`ORDER_${new Date().getTime()}`);
    const [customerId, setCustomerId] = useState(`CUST_${new Date().getTime()}`);

    // Function to handle payment
    const handlePayment = async () => {
      console.log("Hi");
        try {
            
            const response = await axios.post('/generateTransactionToken', {
                totalPrice,
                orderId,
                customerId,
            });

            const { txnToken } = response.data;

            const config = {
                root: '',
                flow: 'DEFAULT',
                data: {
                    orderId,
                    token: txnToken,
                    tokenType: 'TXN_TOKEN',
                    totalPrice,
                },
                handler: {
                    notifyMerchant: function(eventName, data) {
                        console.log('notifyMerchant handler function called', eventName, data);
                    },
                },
            };

            window.Paytm.CheckoutJS.init(config).then(() => {
                window.Paytm.CheckoutJS.invoke();
            });
        } catch (error) {
            console.error('Error generating transaction token:', error);
        }
  };

  // Function to handle increasing quantity
  const increaseQuantity = (id) => {
    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === id) {
          return { ...item, quantity: (item.quantity || 0) + 1 };
        }
        return item;
      });
    });
  };

  // Function to handle decreasing quantity
  const decreaseQuantity = (id) => {
    setItems(prevItems => {
      return prevItems.map(item => {
        if (item.id === id && item.quantity > 0) {
          return { ...item, quantity: item.quantity - 1 };
        }
        return item;
      });
    });
  };

  // Function to calculate total price of selected items
  const calculateTotalPrice = () => {
    let totalPrice = 0;
    items.forEach(item => {
      totalPrice += (item.quantity || 0) * item.price;
    });
    return totalPrice.toFixed(2);
  };

  return (
    <div className="item-list-container">
      <h1>Welcome to JC !!</h1>
      <h2>Menu</h2>
      <table className="item-table">
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>₹{item.price.toFixed(2)}</td>
              <td className="quantity-cell">
                <button onClick={() => decreaseQuantity(item.id)}>-</button>
                <span className="quantity">{item.quantity || 0}</span>
                <button onClick={() => increaseQuantity(item.id)}>+</button>
              </td>
              <td>₹{(item.quantity || 0) * item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="total-price">
        <h3>Total Price: ₹{calculateTotalPrice()}</h3>
        <div className="button-container"><button type="submit" onClick={handlePayment}>Pay</button></div>
      </div>
    </div>
  );
};

export default ItemList;
