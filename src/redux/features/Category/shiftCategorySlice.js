// // src/redux/features/category/shiftCategorySlice.js

// import { createSlice } from '@reduxjs/toolkit';
// import { 
//   // fetchCutoffData,
//    saveCutoffData } from './shiftCategoryThunks';

// const initialState = {
//   data: null,
//   status: 'idle',
//   error: null,
//   formData: {
//     booking: '',
//     cancellation: '',
//   },
//   editingId: null,
// };

// const shiftCategorySlice = createSlice({
//   name: 'shiftCategory',
//   initialState,
//   reducers: {
//     setFormData: (state, action) => {
//       state.formData = action.payload;
//     },
//     updateFormField: (state, action) => {
//       const { name, value } = action.payload;
//       state.formData[name] = value;
//     },
//     setEditingId: (state, action) => {
//       state.editingId = action.payload;
//     },
//     resetForm: (state) => {
//       state.formData = { booking: '', cancellation: '' };
//       state.editingId = null;
//     },
//   },
//   extraReducers: (builder) => {
//     builder
//       .addCase(fetchCutoffData.pending, (state) => {
//         state.status = 'loading';
//         state.error = null;
//       })
//       .addCase(fetchCutoffData.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.data = action.payload;

//         if (action.payload) {
//           const { booking_cutoff, cancellation_cutoff, id } = action.payload;
//           state.formData = {
//             booking: booking_cutoff?.toString() || '',
//             cancellation: cancellation_cutoff?.toString() || '',
//           };
//           state.editingId = id;
//         }
//       })
//       .addCase(fetchCutoffData.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       })
//       .addCase(saveCutoffData.pending, (state) => {
//         state.status = 'saving';
//         state.error = null;
//       })
//       .addCase(saveCutoffData.fulfilled, (state, action) => {
//         state.status = 'succeeded';
//         state.data = action.payload;

//         const { booking_cutoff, cancellation_cutoff, id } = action.payload;
//         state.formData = {
//           booking: booking_cutoff?.toString() || '',
//           cancellation: cancellation_cutoff?.toString() || '',
//         };
//         state.editingId = id;
//       })
//       .addCase(saveCutoffData.rejected, (state, action) => {
//         state.status = 'failed';
//         state.error = action.payload;
//       });
//   },
// });

// export const {
//   setFormData,
//   updateFormField,
//   setEditingId,
//   resetForm,
// } = shiftCategorySlice.actions;

// export default shiftCategorySlice.reducer;


// src/redux/features/category/shiftCategorySlice.js

import { createSlice } from '@reduxjs/toolkit';
import { 
  fetchCutoffData, 
  saveCutoffData 
} from './shiftCategoryThunks';

const initialState = {
  data: null,
  status: 'idle',
  error: null,
  formData: {
    booking: '',
    cancellation: '',
  },
  editingId: null,
};

const shiftCategorySlice = createSlice({
  name: 'shiftCategory',
  initialState,
  reducers: {
    setFormData: (state, action) => {
      state.formData = action.payload;
    },
    updateFormField: (state, action) => {
      const { name, value } = action.payload;
      state.formData[name] = value;
    },
    setEditingId: (state, action) => {
      state.editingId = action.payload;
    },
    resetForm: (state) => {
      state.formData = { booking: '', cancellation: '' };
      state.editingId = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCutoffData.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchCutoffData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;

        if (action.payload) {
          const { booking_cutoff, cancellation_cutoff, id } = action.payload;
          state.formData = {
            booking: booking_cutoff?.toString() || '',
            cancellation: cancellation_cutoff?.toString() || '',
          };
          state.editingId = id;
        }
      })
      .addCase(fetchCutoffData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      })
      .addCase(saveCutoffData.pending, (state) => {
        state.status = 'saving';
        state.error = null;
      })
      .addCase(saveCutoffData.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.data = action.payload;

        const { booking_cutoff, cancellation_cutoff, id } = action.payload;
        state.formData = {
          booking: booking_cutoff?.toString() || '',
          cancellation: cancellation_cutoff?.toString() || '',
        };
        state.editingId = id;
      })
      .addCase(saveCutoffData.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload;
      });
  },
});

export const {
  setFormData,
  updateFormField,
  setEditingId,
  resetForm,
} = shiftCategorySlice.actions;

export default shiftCategorySlice.reducer;
