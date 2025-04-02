export const scrollTo = (el?: Element | null, offset = 0) => {
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY + offset;
  window.scroll({
    top: y,
    behavior: "smooth",
  });
};
