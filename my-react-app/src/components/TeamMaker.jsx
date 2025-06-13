import { useState, useEffect } from "react";
import FileHandler from "./FileHandler.jsx";
import {
  Container,
  Typography,
  FormGroup,
  Box,
  Grid,
  Checkbox,
  TextField,
  Divider,
  Button,
  Paper,
} from "@mui/material";
import Autocomplete, { createFilterOptions } from "@mui/material/Autocomplete";
import { grey } from "@mui/material/colors";

const filter = createFilterOptions();

const TeamMaker = ({ teams }) => {
  const [memberSkills, setMemberSkills] = useState({});
  const [allSkills, setAllSkills] = useState({});

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/ankmay0/teamManager1/main/my-react-app/public/SkillsData.json"
    )
      .then((res) => res.json())
      .then((data) => {
        const grouped = {};
        data.forEach((skill) => {
          if (!grouped[skill.employeeId]) grouped[skill.employeeId] = [];
          grouped[skill.employeeId].push(skill);
        });
        setAllSkills(grouped);
      });
  }, []);

  const toggleCheckbox = (teamId) => {
    setMemberSkills((prev) => {
      const existing = prev[teamId] || { checked: false };
      return {
        ...prev,
        [teamId]: { ...existing, checked: !existing.checked },
      };
    });
  };

  const updateSkill = (teamId, memberId, skill) => {
    setMemberSkills((prev) => {
      const team = prev[teamId] || { checked: true };
      return {
        ...prev,
        [teamId]: {
          ...team,
          [memberId]: skill.expertise,
        },
      };
    });
  };

  const addSkill = (memberId, expertise) => {
    const newSkill = {
      id: Date.now(), // unique ID
      expertise,
      experience: "Beginner", // default value
    };
    setAllSkills((prev) => ({
      ...prev,
      [memberId]: prev[memberId] ? [...prev[memberId], newSkill] : [newSkill],
    }));
    return newSkill;
  };

  return (
    <Container
      maxWidth="lg"
      sx={{
        mt: 4,
        mb: 4,
        border: 1,
        borderColor: grey[400],
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h3"
        fontWeight="bold"
        gutterBottom
        sx={{ mt: 7, mb: 4, textAlign: "center" }}
      >
        Team Skill Assignment
      </Typography>

      {teams?.length ? (
        <FormGroup>
          {teams.map((team) => {
            const members = [
              { id: team.srcId, name: team.srcName },
              { id: team.targetId, name: team.targetName },
            ];

            return (
              <Box key={team.teamId} sx={{ py: 3 }}>
                <Grid container spacing={2} alignItems="center">
                  <Checkbox
                    checked={memberSkills?.[team.teamId]?.checked || false}
                    onChange={() => toggleCheckbox(team.teamId)}
                  />

                  {members.map((member) => (
                    <Grid item key={member.id}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 1 }}
                      >
                        <Typography
                          variant="h6"
                          sx={{ minWidth: 100, fontWeight: "bold" }}
                        >
                          {member.name}
                        </Typography>

                        <Autocomplete
                          disabled={!memberSkills?.[team.teamId]?.checked}
                          value={
                            memberSkills?.[team.teamId]?.[member.id] || null
                          }
                          options={[
                            {
                              disabled: true,
                              expertise: "Skill",
                              experience: "Experience",
                            },
                            ...(allSkills[member.id] || []),
                          ]}
                          filterOptions={(options, params) => {
                            const filtered = filter(options, params);
                            const isExisting = options.some(
                              (option) =>
                                option.expertise
                                  .toLowerCase()
                                  .trim() ===
                                params.inputValue.toLowerCase().trim()
                            );
                            if (params.inputValue !== "" && !isExisting) {
                              filtered.push({
                                inputValue: params.inputValue,
                                expertise: `Add "${params.inputValue}"`,
                                disabled: false,
                              });
                            }
                            return filtered;
                          }}
                          getOptionLabel={(option) =>
                            typeof option === "string"
                              ? option
                              : option.inputValue
                              ? option.expertise
                              : option.expertise
                          }
                          onChange={(e, val) => {
                            if (!val || val.disabled) return;
                            const skill =
                              typeof val === "string"
                                ? addSkill(member.id, val)
                                : val.inputValue
                                ? addSkill(member.id, val.inputValue)
                                : val;
                            updateSkill(team.teamId, member.id, skill);
                          }}
                          renderOption={(props, option) => (
                            <li {...props} key={option.id || option.expertise}>
                              <Box
                                sx={{
                                  display: "flex",
                                  justifyContent: "space-between",
                                  width: "100%",
                                  fontSize: 14,
                                }}
                              >
                                <span>{option.expertise}</span>
                                <span>
                                  {option.experience
                                    ? option.experience
                                    : ""}
                                </span>
                              </Box>
                            </li>
                          )}
                          renderInput={(params) => (
                            <TextField
                              {...params}
                              label="Select / Add Skill"
                              sx={{ minWidth: 270 }}
                            />
                          )}
                        />
                      </Box>
                    </Grid>
                  ))}
                </Grid>
                <Divider sx={{ mt: 4 }} />
              </Box>
            );
          })}
        </FormGroup>
      ) : (
        <Typography sx={{ textAlign: "center", mt: 2 }}>
          No team data available.
        </Typography>
      )}

      <FileHandler selections={memberSkills} />
    </Container>
  );
};

export default TeamMaker;
