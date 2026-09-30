import { getBadge } from "../../utils/badges";

const Badge = ({ type, value, icon: Icon }) => {
  const { label, classes, dot } = getBadge(type, value);

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${classes}`}
    >
      {dot && <span className={`h-1.5 w-1.5 rounded-full ${dot}`} />}
      {Icon && <Icon className="h-3 w-3" />}
      {label}
    </span>
  );
};

export default Badge;