import { UserSearchBar } from "./index";
import { ConversationList } from "./index";
import Cookies from "universal-cookie";
import PropTypes from "prop-types";

const cookies = new Cookies();

const LeftPanel = ({ changeConversationId }) => {
  return (
    <div className="bg-side-bar-bg p-2 w-1/3 flex flex-col justify-between">
      <div>
        <UserSearchBar />
        <ConversationList changeConversationId={changeConversationId} />
      </div>
      <button
        className="btn btn-error text-white"
        onClick={() => {
          cookies.remove("token");
          cookies.remove("user");
          window.location.reload();
        }}
      >
        Logout
      </button>
    </div>
  );
};

LeftPanel.propTypes = {
  changeConversationId: PropTypes.func.isRequired, // Add validation
};

export default LeftPanel;
