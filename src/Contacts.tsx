import React, { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  styled,
  TextField,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";

// Styled Components
const StyledHeader = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledFilterTabs = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-around",
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledContactList = styled(List)(({ theme }) => ({
  padding: theme.spacing(2),
}));

const StyledListItem = styled(ListItem)(({ theme }) => ({
  display: "flex",
  justifyContent: "space-between",
  padding: theme.spacing(1, 2),
}));

const StyledContactInfo = styled(Box)({
  display: "flex",
  flexDirection: "column",
});

const Contacts: React.FC = () => {
  const [searchVisible, setSearchVisible] = useState(false);

  return (
    <Box sx={{ maxWidth: 480, mx: "auto", bgcolor: "#fff", color: "#000" }}>
      <StyledHeader>
        <Typography variant="h6">Contacts</Typography>
        <IconButton onClick={() => setSearchVisible(!searchVisible)}>
          <SearchIcon />
        </IconButton>
      </StyledHeader>

      {/* Conditionally render search bar */}
      {searchVisible && (
        <Box sx={{ padding: 2 }}>
          <TextField
            variant="outlined"
            placeholder="Search contacts..."
            fullWidth
          />
        </Box>
      )}

      <StyledFilterTabs>
        <Typography variant="body2">All 24</Typography>
        <Typography variant="body2">Teams 15</Typography>
        <Typography variant="body2">Members 9</Typography>
      </StyledFilterTabs>

      <Box sx={{ padding: 2 }}>
        <Typography variant="body2">
          Virtual Health Assistants/Physical Therapists
        </Typography>
      </Box>

      <StyledContactList>
        <Divider />
        <StyledListItem>
          <StyledContactInfo>
            <Typography variant="subtitle1">Team</Typography>
            <Typography variant="body2">Active 8 days ago</Typography>
          </StyledContactInfo>
          <Typography variant="subtitle1">Olivia Dunn</Typography>
        </StyledListItem>
        <Divider />
        <StyledListItem>
          <StyledContactInfo>
            <Typography variant="subtitle1">Member</Typography>
            <Typography variant="body2">Active now</Typography>
          </StyledContactInfo>
          <Typography variant="subtitle1">Mario Mangione</Typography>
        </StyledListItem>
        <Divider />
        <StyledListItem>
          <StyledContactInfo>
            <Typography variant="subtitle1">Member</Typography>
            <Typography variant="body2">Active 3 days ago</Typography>
          </StyledContactInfo>
          <Typography variant="subtitle1">Leon Hart</Typography>
        </StyledListItem>
        <Divider />
        <StyledListItem>
          <StyledContactInfo>
            <Typography variant="subtitle1">Member</Typography>
            <Typography variant="body2">Active now</Typography>
          </StyledContactInfo>
          <Typography variant="subtitle1">John Kennedy</Typography>
        </StyledListItem>
        <Divider />
      </StyledContactList>
    </Box>
  );
};

export default Contacts;
