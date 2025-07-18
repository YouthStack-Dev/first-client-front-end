import React from 'react';
import PropTypes from 'prop-types';
import GoogleMapView from './Map';

const AddressForm = ({ formData, onChange, onCheckboxChange, errors, onSubmit, isSubmitting }) => {
 
 


  return (

  <GoogleMapView/>
   
  );
};

AddressForm.propTypes = {
  formData: PropTypes.shape({
    address: PropTypes.string,
    geoCoordinates: PropTypes.string,
    landmark: PropTypes.string,
    showAll: PropTypes.bool,
  }).isRequired,
  onChange: PropTypes.func.isRequired,
  onCheckboxChange: PropTypes.func.isRequired,
  errors: PropTypes.object.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool.isRequired,
};

export default AddressForm;