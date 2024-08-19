export const isPWA = () => {
  if ("standalone" in window.navigator) {
    return window.navigator.standalone;
  }
  return window.matchMedia("(display-mode: standalone)").matches;
};
