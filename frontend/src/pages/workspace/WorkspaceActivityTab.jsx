import { useParams } from "react-router-dom";
import PageHeader from "../../components/common/PageHeader";
import ActivityFeed from "../../components/common/ActivityFeed";

const WorkspaceActivityTab = () => {
  const { workspaceId } = useParams();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Workspace feed"
        title="Activity"
        description="Recent changes across the entire workspace."
      />

      <ActivityFeed
        url={`/api/workspaces/${workspaceId}/activity`}
        emptyTitle="No activity yet"
        emptyDescription="Workspace updates will appear here as the team starts working."
      />
    </div>
  );
};

export default WorkspaceActivityTab;