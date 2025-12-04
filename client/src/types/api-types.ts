export interface User {
    role_id: number;
    country: string;
    city: string;
    date_of_birth: string | number | Date;
    user_id: string;
    full_name: string;
    dob: string;
    gender: string;
    email: string;
    displayName: string;
    photoURL: string;
    provider: string;
    _id: string;
    role: string;
}
export type MessageResponse = {
    success: boolean;
    message: string;
}

export type UserLoginResponse = {
    success: boolean;
    user: User;
    token: string;
}

export type UserLoginRequest = {
    email: string;
    password: string;
}

export type UserRegisterRequest = {
    email: string;
    password: string;
    name: string;
    gender: string;
    dob: string
}

export type AllUserResponse = {
    success: boolean;
    users: User[];
}

export type UserResponse = {
    success: boolean;
    user: User;
}

export interface UserReducerIntialState {
    user: User | null;
    loading: boolean;
}

// Product
export interface Product {
    name: string;
    product_id: string;
    category: string;
    stock: number;
    photo: string;
    photos?: string[];
    colors?: { name: string; code: string; hex?: string }[];
    sizes?: string[];
    materials?: string;
    care?: string;
    price: number;
    currency: string;
    description: string;
    featured: boolean;
    createdAt: string;
    updatedAt: string;
}

// Product Rating
export interface ProductRating {
    created_at: string;
    product_review_id: string;
    product_id: string;
    rating: number;
    title: string;
    comment: string;
    createdAt: string;
    updatedAt: string;
}

export interface ProductResponse {
    success: boolean;
    products: Product[];
    totalProducts: number;
    totalPages: number;
    currentPage: number;
}

// Product Rating Response
export interface ProductRatingResponse {
    success: boolean;
    productRatings: ProductRating[];
    totalProducts: number;
    totalPages: number;
    currentPage: number;
}

interface SortBy {
    id: string;
    desc: boolean;
}

export interface ProductRequest {
    page: number;
    limit: number;
    sortBy?: SortBy;
}

// New Product
export type NewProductRequest = {
    formData: FormData;
}

// Product Details
export type ProductDetailResponse = {
    success: boolean;
    product: Product;
}

// Update Product
export type UpdateProductRequest = {
    productId: string;
    formData: FormData;
}

// Delete Product
export type DeleteProductRequest = {
    productId: string;
}
// Category
export type Category = {
    category_id: number;
    name: string;
    parent_category_id: number;
    type: string;
    img_url: string;
    created_at: string;
    updated_at: string;
}

// Category response
export type CategoriesResponse = {
    success: boolean;
    categories: Category[];
}

// feature Product
export type FeatureProductRequest = {
    productId: string;
}

// Search Product
export type SearchProductRequest = {
    price?: string;
    page: number;
    category?: string;
    category_id?: string | number;
    search: string;
    sort?: string;
}

export type SearchProductResponse = ProductResponse & {
    totalPage: number;
}

// -- Order Types -- 
// Cart Item
export type CartItem = {
    productId: string;
    photo: string;
    name: string;
    price: number;
    currency: string;
    quantity: number;
    stock: number;
    photos?: string[];
};

// Shipping Info
export type ShippingInfo = {
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
    phone: string;
}

// Order Item
export type OrderItem = {
    order_item_id: string;
    product_id: string;
    quantity: number;
    unit_price: number;
    total_price: number;
    product?: Product;
};

// Order 
export type Order = {
    orderItems: OrderItem[];
    shipping_info: ShippingInfo;
    subtotal: number;
    tax: number;
    shipping_charges: number;
    discount: number;
    order_total: number;
    status: string;
    user: {
        full_name: string;
        user_id: string;
    };
    order_id: string;
    currency: string;
    created_at: string;
    updated_at: string;
}

// All Orders
export type AllOrdersResponse = {
    success: boolean;
    orders: Order[];
}

// Order Details
export type OrderDetailsResponse = {
    success: boolean;
    order: Order;
}

// New Order 
export type NewOrderRequest = {
    orderItems: CartItem[];
    subTotal: number;
    tax: number;
    shippingCharges: number;
    discount: number;
    total: number;
    shippingInfo: ShippingInfo;
    userId: string;
}

// Update Order
export type UpdateOrderRequest = {
    orderId: string;
    status: string;
}

//  -- Coupon Types --
export type Coupon = {
    code: string;
    amount: number;
    id: string;
    createdAt: string;
    updatedAt: string;
}

export type AllCouponsResponse = {
    success: boolean;
    coupons: Coupon[];
}

export type AllCouponsRequest = {
    page: number;
}

export type ApplyCouponRequest = {
    code: string;
}

export type ApplyCouponResponse = {
    success: boolean;
    coupon: Coupon;
    message: string;
}

export type NewCouponRequest = {
    code: string;
    amount: number | string;
}

export type DeleteCouponRequest = {
    couponId: string;
}

interface Stats {
    totalRevenue: number;
    revenueByMonth: {
        [key: string]: number;
    };
    revenueByWeek: {
        [key: string]: number;
    };
    revenueByDay: {
        [key: string]: number;
    };
    salesByCategory: {
        [key: string]: number;
    };
    bestSellingProducts: {
        productId: string;
        quantity: number;
    }[];
    userGenderDemographic: {
        _id: string;
        count: number;
    }[];
    totalOrders: number;
    latestOrders: Order[];
    totalProducts: number;
    totalCoupons: number;
}

// Stats
export interface StatsResponse {
    success: boolean;
    stats: Stats;
}



// -- Reducer Types --

// Cart Reducer Initial State
export interface CartReducerIntialState {
    loading: boolean;
    cartItems: CartItem[];
    subTotal: number;
    tax: number;
    total: number;
    shippingCharges: number;
    discount: number;
    shippingInfo: ShippingInfo;
}

export type CustomError = {
    status: number;
    data: {
        message: string;
        success: boolean;
    }
}