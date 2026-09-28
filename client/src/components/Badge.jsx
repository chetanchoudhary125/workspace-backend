import { getBadge } from "../utils/badges";

const Badge = ({ type, value }) => {
  const { label, classes } = getBadge(type, value);
  return (
    <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-medium ${classes}`}>
      {label}
    </span>
  );
};

export default Badge;