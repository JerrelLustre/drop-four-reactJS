export default function Button({ label, onClick }) {
    const baseClasses =
    "font-seurat hover:bg-buttonBgHover active:bg-buttonBgClick text-base text-white bg-buttonBg hover:bg-sky-700 border-b-2 border-b-buttonStroke px-5 py-2 rounded-[0.5rem]"
  
    return (
      <button className={`${baseClasses}`} onClick={onClick}>
        {label}
      </button>
    );
  }
