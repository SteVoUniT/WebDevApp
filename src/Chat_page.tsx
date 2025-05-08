import React from "react";
import { Typography, Box } from "@mui/material"; // Import Typography and Box

const Chat: React.FC = () => {
  return (
    <Box sx={{ p: 3, bgcolor: "#fff", color: "#000" }}>
      <Typography variant="h5" style={{ wordWrap: "break-word" }}>
        Chat View
      </Typography>
      <Typography>
        Lorem ipsum odor amet, consectetuer adipiscing elit. Tortor sit sed
        montes tristique consectetur mi ultrices. Mattis suspendisse rhoncus
        lectus venenatis sapien eleifend conubia. Efficitur lobortis
        sollicitudin, himenaeos mattis nunc taciti. Venenatis duis arcu purus
        turpis ante fusce mus placerat. Auctor ligula odio per, nibh venenatis
        felis. Per laoreet nulla aptent facilisi ac est dictum congue. Sociosqu
        suscipit primis nostra; praesent ut facilisi
        <br />
        <br />
        Quisque quisque tortor mauris maximus consequat euismod. Placerat nam
        hac nostra; pellentesque phasellus vivamus. Nulla commodo habitant morbi
        curae penatibus efficitur viverra diam nisl. Suspendisse sociosqu
        pharetra consequat ac nam ultrices aptent. Nulla taciti nascetur ornare
        neque nunc hendrerit mattis. Elit laoreet semper elit morbi aenean
        sagittis. Enim erat id dignissim maximus ullamcorper elementum lacinia
        posuere. Dui sed urna porttitor tempus natoque quam nisl? Suspendisse
        aptent condimentum neque cubilia etiam at dolor. Rutrum fermentum at
        phasellus mi eu justo.
      </Typography>
    </Box>
  );
};

export default Chat;
