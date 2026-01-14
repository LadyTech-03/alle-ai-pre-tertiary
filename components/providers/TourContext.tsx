import React, { createContext, useContext, useState } from 'react';

const TourContext = createContext({
  open: false,
  setOpen: (open: boolean) => {},
  startTour: () => {}
});

export const useTour = () => useContext(TourContext);

export const TourProvider = ({ children }: any) => {
  const [open, setOpen] = useState(false);

  const startTour = () => {
    setOpen(true);
  };

  return (
    <TourContext.Provider value={{ open, setOpen, startTour }}>
      {children}
    </TourContext.Provider>
  );
};