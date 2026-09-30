import { useParams } from "react-router-dom";
import ActivityFeed from "../../components/common/ActivityFeed";

const ProjectActivityTab = () => {
  const { projectId } = useParams();

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Project activity
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Recent changes inside this project.
        </p>
      </div>

      <ActivityFeed
        url={`/api/projects/${projectId}/activity`}
        emptyTitle="No activity yet"
        emptyDescription="Project updates will appear here as work happens."
      />
    </div>
  );
};

export default ProjectActivityTab;