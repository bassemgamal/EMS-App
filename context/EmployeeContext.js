"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

const EmployeeContext = createContext();

export const EmployeeProvider = ({ children }) => {
    const [activeEmployee, setActiveEmployee] = useState(null);

    // Persist to local storage for demo purposes
    useEffect(() => {
        const saved = localStorage.getItem('activeEmployee');
        if (saved) setActiveEmployee(JSON.parse(saved));
    }, []);

    useEffect(() => {
        if (activeEmployee) {
            localStorage.setItem('activeEmployee', JSON.stringify(activeEmployee));
        }
    }, [activeEmployee]);

    return (
        <EmployeeContext.Provider value={{ activeEmployee, setActiveEmployee }}>
            {children}
        </EmployeeContext.Provider>
    );
};

export const useEmployee = () => useContext(EmployeeContext);
