import { createContext, useContext, useState } from "react";

const SellContext = createContext();

export const SellProvider = ({ children }) => {
  const [step, setStep] = useState(0);

  const [data, setData] = useState({
    category: "",
    title : '',
    description : '',
    form_data: {},
    images: [],
    price: null,
    location: {}
  });

  /** ───────────────────────────────
   * STEP HANDLERS
   *───────────────────────────────*/
  const nextStep = () => setStep((prev) => prev + 1);
  const prevStep = () => setStep((prev) => (prev > 0 ? prev - 1 : 0));
  const clearStep = () => setStep(0);

  /** ───────────────────────────────
   * DATA HANDLERS
   *───────────────────────────────*/

  // ✅ For normal text/number/location inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocation = ({ lat, lng, place }) => {
    setData((prev) => ({
      ...prev,
      location : { lat : lat, lng : lng, place: place }
    }));
  };

  // ✅ For nested custom form fields
  const handleFormDataChange = (e) => {
    const { name, value } = e.target;
    setData((prev) => ({
      ...prev,
      form_data: { ...prev.form_data, [name]: value },
    }));
  };

  // ✅ For category button selection
  const handleCategorySelect = (categoryName) => {
    setData((prev) => ({ ...prev, category: categoryName }));
  };

  // ✅ For image uploads
  const handleImageChange = (imagesArray) => {
  setData((prev) => ({ ...prev, images: imagesArray }));
};

  // ✅ Reset everything
  const resetAll = () => {
    setStep(0);
    setData({
      category: "",
      form_data: {},
      images: [],
      price: null,
      location: ""
    });
  };

  return (
    <SellContext.Provider
      value={{
        step,
        nextStep,
        prevStep,
        clearStep,
        data,
        setData,
        handleChange,
        handleFormDataChange,
        handleImageChange,
        handleCategorySelect,
        handleLocation,
        resetAll
      }}
    >
      {children}
    </SellContext.Provider>
  );
};

export const useSell = () => useContext(SellContext);
