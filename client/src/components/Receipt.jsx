import React from 'react';
import { Separator } from "@/components/ui/separator";
export var Receipt = function (_a) {
    var _b, _c;
    var order = _a.order, customer = _a.customer, address = _a.address;
    var formatDate = function (dateString) {
        return new Date(dateString).toLocaleString('en-PH', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };
    var formatCurrency = function (amount) {
        return "\u20B1".concat(parseFloat(amount).toFixed(2));
    };
    return (<div id="receipt-content" className="max-w-md mx-auto bg-white text-black p-6 font-mono text-sm">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-xl font-bold mb-2">GASFLOW LPG</h1>
        <p className="text-sm">Liquefied Petroleum Gas Delivery</p>
        <p className="text-xs text-gray-600">Fast • Reliable • Safe</p>
      </div>

      <Separator className="mb-4"/>

      {/* Receipt Info */}
      <div className="mb-4">
        <div className="flex justify-between mb-1">
          <span>Receipt #:</span>
          <span className="font-bold">{order.orderNumber}</span>
        </div>
        <div className="flex justify-between mb-1">
          <span>Order Date:</span>
          <span>{formatDate(order.createdAt)}</span>
        </div>
        {order.deliveredAt && (<div className="flex justify-between mb-1">
            <span>Delivered:</span>
            <span>{formatDate(order.deliveredAt)}</span>
          </div>)}
        <div className="flex justify-between">
          <span>Status:</span>
          <span className="capitalize font-semibold">
            {order.status.replace('_', ' ')}
          </span>
        </div>
      </div>

      <Separator className="mb-4"/>

      {/* Customer Info */}
      <div className="mb-4">
        <h3 className="font-bold mb-2">CUSTOMER DETAILS</h3>
        <div className="text-xs space-y-1">
          <div>{customer.name}</div>
          <div>{customer.email}</div>
          {customer.phone && <div>{customer.phone}</div>}
        </div>
      </div>

      {/* Delivery Address */}
      {address && (<div className="mb-4">
          <h3 className="font-bold mb-2">DELIVERY ADDRESS</h3>
          <div className="text-xs space-y-1">
            <div>{address.street}</div>
            <div>{address.city}, {address.province}</div>
            <div>{address.zipCode}</div>
          </div>
        </div>)}

      <Separator className="mb-4"/>

      {/* Order Items */}
      <div className="mb-4">
        <h3 className="font-bold mb-2">ORDER DETAILS</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Product:</span>
            <span>{(_b = order.product) === null || _b === void 0 ? void 0 : _b.name}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Weight:</span>
            <span>{(_c = order.product) === null || _c === void 0 ? void 0 : _c.weight}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Type:</span>
            <span className="capitalize">{order.type}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Quantity:</span>
            <span>{order.quantity} tank{order.quantity > 1 ? 's' : ''}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Unit Price:</span>
            <span>{formatCurrency(order.unitPrice)}</span>
          </div>
        </div>
      </div>

      <Separator className="mb-4"/>

      {/* Payment Summary */}
      <div className="mb-4">
        <h3 className="font-bold mb-2">PAYMENT SUMMARY</h3>
        
        <div className="space-y-2">
          <div className="flex justify-between">
            <span>Subtotal:</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Delivery Fee:</span>
            <span>FREE</span>
          </div>
          
          <Separator className="my-2"/>
          
          <div className="flex justify-between font-bold text-lg">
            <span>TOTAL:</span>
            <span>{formatCurrency(order.totalAmount)}</span>
          </div>
          
          <div className="flex justify-between mt-2">
            <span>Payment Method:</span>
            <span className="uppercase">{order.paymentMethod}</span>
          </div>
          
          <div className="flex justify-between">
            <span>Payment Status:</span>
            <span className="capitalize font-semibold text-green-600">
              {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (<>
          <Separator className="mb-4"/>
          <div className="mb-4">
            <h3 className="font-bold mb-2">NOTES</h3>
            <p className="text-xs">{order.notes}</p>
          </div>
        </>)}

      <Separator className="mb-4"/>

      {/* Footer */}
      <div className="text-center text-xs space-y-2">
        <p className="font-bold">Thank you for choosing GasFlow!</p>
        <p>For support, contact us at:</p>
        <p>Email: support@gasflow.com</p>
        <p>Phone: +63 912 345 6789</p>
        <p className="text-gray-500 mt-4">
          This is an electronic receipt.
        </p>
      </div>
    </div>);
};
export default Receipt;
