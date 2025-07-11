// /**
//  * Attach common pending/fulfilled/rejected handlers for a thunk.
//  * @param {ActionReducerMapBuilder} builder
//  * @param {AsyncThunk} asyncThunk
//  * @param {Object} options
//  *   keyPrefix: string for state keys (e.g., 'employees')
//  *   targetField: state field to put payload into (e.g., 'employees')
//  */
// export const handleAsyncThunk = (builder, asyncThunk, { keyPrefix, targetField }) => {
//     builder
//       .addCase(asyncThunk.pending, (state) => {
//         state[`${keyPrefix}Status`] = 'loading';
//         state[`${keyPrefix}Error`] = null;
//       })
//       .addCase(asyncThunk.fulfilled, (state, action) => {
//         state[`${keyPrefix}Status`] = 'succeeded';
//         if (targetField) {
//           state[targetField] = action.payload;
//         }
//       })
//       .addCase(asyncThunk.rejected, (state, action) => {
//         state[`${keyPrefix}Status`] = 'failed';
//         state[`${keyPrefix}Error`] = action.payload || action.error.message;
//       });
//   };
  