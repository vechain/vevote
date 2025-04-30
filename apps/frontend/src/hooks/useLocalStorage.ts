import { useState, useEffect, useCallback } from "react";

/**
 * A custom React hook that provides localStorage functionality with React state synchronization.
 *
 * @param key - The localStorage key to manage
 * @param initialValue - The initial value to use if no value exists in localStorage
 * @returns A tuple containing: [storedValue, setValue, removeItem]
 */

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // Get from localStorage then
  // parse stored json or return initialValue
  const readValue = useCallback((): T => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [initialValue, key]);

  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Return a wrapped version of useState's setter function that
  // persists the new value to localStorage
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === "undefined") {
        console.warn(`Tried setting localStorage key "${key}" even though environment is not a client`);
      }

      try {
        // Allow value to be a function so we have the same API as useState
        const valueToStore = value instanceof Function ? value(storedValue) : value;

        // Save state
        setStoredValue(valueToStore);

        // Save to localStorage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));

        // Dispatch a custom event so other instances of useLocalStorage with the same key can update
        window.dispatchEvent(new Event("local-storage-change"));
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [storedValue, key],
  );

  // Remove item from localStorage
  const removeItem = useCallback(() => {
    if (typeof window === "undefined") {
      console.warn(`Tried removing localStorage key "${key}" even though environment is not a client`);
      return;
    }

    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
      window.dispatchEvent(new Event("local-storage-change"));
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [initialValue, key]);

  // Listen for changes to this localStorage key in other tabs/windows
  useEffect(() => {
    const handleStorageChange = () => {
      setStoredValue(readValue());
    };

    // this handles local storage changes within the same window
    window.addEventListener("local-storage-change", handleStorageChange);

    // this handles storage events from other windows
    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("local-storage-change", handleStorageChange);
      window.removeEventListener("storage", handleStorageChange);
    };
  }, [readValue]);

  return [storedValue, setValue, removeItem];
}
