import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

interface State {
    showShareModal: boolean;
    movieId?: number;
}

const initialState: State = {
    showShareModal : false
};


const modalSlice = createSlice({
    name: 'modal',
    initialState,
    reducers: {
        showShareModal: (state, action: PayloadAction<number>) => {
            state.movieId = action.payload;
            state.showShareModal = true;
        },
        hideShareModal: (state) => {
            state.movieId = undefined;
            state.showShareModal = false;
        }
    },
});

export const { showShareModal, hideShareModal } = modalSlice.actions;
export default modalSlice.reducer;

