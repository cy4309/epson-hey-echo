import PropTypes from "prop-types";

const BaseButton = ({ label, className, onClick, children, disabled }) => {
  return (
    <button
      className={`py-2 px-6 cursor-pointer inline-flex justify-center items-center border transition-colors duration-150 rounded-xl shadow-lg dark:shadow-[0_4px_6px_rgba(255,255,255,0.2)] hover:bg-secondary ${
        disabled ? "cursor-not-allowed opacity-30" : ""
      } ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {/* {label || children} */}
      {children ?? label}
    </button>
  );
};

BaseButton.propTypes = {
  label: PropTypes.string,
  className: PropTypes.string,
  onClick: PropTypes.func,
  children: PropTypes.node,
  disabled: PropTypes.bool,
};

export default BaseButton;
