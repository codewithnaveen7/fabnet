import { useCallback, useRef } from 'react';

function useToggleMenu() {
  const menuRef = useRef();

  const toggleMenu = useCallback((event) => {
    menuRef.current.toggle(event);
  }, []);

  return [menuRef, toggleMenu];
}

export default useToggleMenu;
