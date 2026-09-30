import { getInitials } from "../../utils/initials";

const PALETTE = [
  "from-indigo-500 to-violet-500",
  "from-sky-500 to-indigo-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-violet-500 to-fuchsia-500",
  "from-cyan-500 to-sky-500",
  "from-orange-500 to-red-500",
];

const pickColor = (name = "") => {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

const SIZES = {
  sm: "h-8 w-8 text-[11px]",
  md: "h-10 w-10 text-xs",
  lg: "h-12 w-12 text-sm",
};

const Avatar = ({ name = "", size = "md", className = "" }) => (
  <div
    aria-hidden="true"
    className={`flex shrink-0 items-center justify-center rounded-full bg-linear-to-br ${pickColor(name)} font-semibold text-white ${SIZES[size] || SIZES.md} ${className}`}
  >
    {getInitials(name)}
  </div>
);

export default Avatar;