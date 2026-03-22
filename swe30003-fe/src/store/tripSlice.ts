import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// Định nghĩa interface cho Location
interface Location {
    latitude: number;
    longitude: number;
    address?: string;
}

// Cập nhật TripStage với trạng thái mới
export type TripStage =
    | 'selectLocations'      // Chọn vị trí pickup và dropoff
    | 'selectVehicle'       // Chọn loại phương tiện
    | 'confirmRide'         // Xác nhận chuyến đi trước khi bắt đầu simulate
    | 'findingDriver'       // Đang tìm tài xế
    | 'driverFound'         // Tài xế đã được tìm thấy
    | 'driverToPickUp'      // Tài xế đang đến điểm pickup
    | 'driverArrivedPickUp' // Tài xế đã đến điểm pickup
    | 'pickupToDropoff'      // Đang trên đường đến dropoff
    | 'completed';          // Hoàn thành chuyến đi

// Interface cho trạng thái chuyến đi
interface TripState {
    pickupLocation: Location | null;  // Vị trí đón khách
    dropoffLocation: Location | null; // Vị trí trả khách
    driverLocation: Location | null;  // Vị trí hiện tại của tài xế
    vehicleType: string | null;       // Loại phương tiện (Motorcycle, UberX, Luxury, v.v.)
    price: number | null;             // Giá chuyến đi
    stage: TripStage;                 // Giai đoạn hiện tại của chuyến đi
}

// Trạng thái ban đầu
const initialState: TripState = {
    pickupLocation: null,
    dropoffLocation: null,
    driverLocation: null,
    vehicleType: null,
    price: null,
    stage: 'selectLocations',
};

// Tạo slice
const tripSlice = createSlice({
    name: 'trip',
    initialState,
    reducers: {
        // Cập nhật vị trí pickup
        setPickupLocation(state, action: PayloadAction<Location>) {
            state.pickupLocation = action.payload;
        },
        // Cập nhật vị trí dropoff
        setDropoffLocation(state, action: PayloadAction<Location>) {
            state.dropoffLocation = action.payload;
        },
        // Cập nhật vị trí tài xế
        setDriverLocation(state, action: PayloadAction<Location>) {
            state.driverLocation = action.payload;
        },
        // Cập nhật loại phương tiện
        setVehicleType(state, action: PayloadAction<string>) {
            state.vehicleType = action.payload;
        },
        // Cập nhật giá
        setPrice(state, action: PayloadAction<number>) {
            state.price = action.payload;
        },
        // Cập nhật giai đoạn chuyến đi
        setStage(state, action: PayloadAction<TripStage>) {
            state.stage = action.payload;
        },
        // Reset toàn bộ trạng thái về ban đầu
        resetTrip(state) {
            state.pickupLocation = null;
            state.dropoffLocation = null;
            state.driverLocation = null;
            state.vehicleType = null;
            state.price = null;
            state.stage = 'selectLocations';
        },
    },
});

// Export các action
export const {
    setPickupLocation,
    setDropoffLocation,
    setDriverLocation,
    setVehicleType,
    setPrice,
    setStage,
    resetTrip,
} = tripSlice.actions;

// Export reducer
export default tripSlice.reducer;