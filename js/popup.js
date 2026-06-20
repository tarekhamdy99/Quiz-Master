//^ Show The Error Popup Function
export default function showErrorPopup(message) {
  const errorPopup = document.getElementById("errorPopup");
  const popupCard = errorPopup?.querySelector(".popup-card");
  const popupErrorMessage = document.getElementById("popupErrorMessage");

  if (!errorPopup || !popupErrorMessage) return;

  //? Message OF The Alert
  popupErrorMessage.textContent = message;

  //? The Background Behind The Popup
  errorPopup.classList.remove("opacity-0", "pointer-events-none");
  errorPopup.classList.add("opacity-100", "pointer-events-auto");

  //? Animation OF Showing The Popup
  popupCard?.classList.remove("scale-90");
  popupCard?.classList.add("scale-100");

  //? Prepare The Close Button
  const closePopupBtn = document.getElementById("closePopupBtn");
  closePopupBtn?.addEventListener(
    "click",
    () => {
      //? Remove The Background, Hide The Alert Card
      errorPopup.classList.remove("opacity-100", "pointer-events-auto");
      errorPopup.classList.add("opacity-0", "pointer-events-none");
      popupCard?.classList.remove("scale-100");
      popupCard?.classList.add("scale-90");

      //? Show The Game Content
      const setupForm = document.getElementById("quizOptions");
      const questionsContainer = document.getElementById("questionsContainer");
      if (setupForm) setupForm.removeAttribute("style");
      if (questionsContainer) questionsContainer.innerHTML = "";
    },
    { once: true },
  );
}
