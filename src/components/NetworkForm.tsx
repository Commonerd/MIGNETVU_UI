import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import axios from "axios";
import styled from "styled-components";

const NetworkForm: React.FC = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    type: "migrant",
    name: "",
    nationality: "",
    ethnicity: "",
    latitude: "",
    longitude: "",
    migrationYear: "",
  });

  const [connections, setConnections] = useState([
    { targetId: "", targetType: "migrant", strength: "", type: "" },
  ]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleConnectionChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const updatedConnections = [...connections];
    updatedConnections[index] = {
      ...updatedConnections[index],
      [e.target.name]: e.target.value,
    };
    setConnections(updatedConnections);
  };

  const addConnection = () => {
    setConnections([
      ...connections,
      { targetId: "", targetType: "migrant", strength: "", type: "" },
    ]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToSubmit = { ...formData, connections };
    try {
      // await axios.post("/api/network", dataToSubmit);
      alert(t("networkAddedSuccess"));
      setFormData({
        type: "migrant",
        name: "",
        nationality: "",
        ethnicity: "",
        latitude: "",
        longitude: "",
        migrationYear: "",
      });
      setConnections([
        { targetId: "", targetType: "migrant", strength: "", type: "" },
      ]); // Reset connections
    } catch (error) {
      alert(t("networkAddError"));
    }
  };

  return (
    <Container>
      <NetworkBox>
        <Title>{t("addNewNetwork")}</Title>
        <form onSubmit={handleSubmit}>
          <div>
            <Label htmlFor="type">{t("entityType")}</Label>
            <Select
              id="type"
              name="type"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="migrant">{t("migrant")}</option>
              <option value="organization">{t("organization")}</option>
            </Select>
          </div>
          <div>
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          {formData.type === "migrant" && (
            <>
              <div>
                <Label htmlFor="nationality">{t("nationality")}</Label>
                <Input
                  type="text"
                  id="nationality"
                  name="nationality"
                  value={formData.nationality}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="ethnicity">{t("ethnicity")}</Label>
                <Input
                  type="text"
                  id="ethnicity"
                  name="ethnicity"
                  value={formData.ethnicity}
                  onChange={handleChange}
                  required
                />
              </div>
            </>
          )}
          <div>
            <Label htmlFor="latitude">{t("latitude")}</Label>
            <Input
              type="number"
              id="latitude"
              name="latitude"
              value={formData.latitude}
              onChange={handleChange}
              required
              step="any"
            />
          </div>
          <div>
            <Label htmlFor="longitude">{t("longitude")}</Label>
            <Input
              type="number"
              id="longitude"
              name="longitude"
              value={formData.longitude}
              onChange={handleChange}
              required
              step="any"
            />
          </div>
          <div>
            <Label htmlFor="migrationYear">
              {formData.type === "migrant"
                ? t("migrationYear")
                : t("foundationYear")}
            </Label>
            <Input
              type="number"
              id="migrationYear"
              name="migrationYear"
              value={formData.migrationYear}
              onChange={handleChange}
              required
            />
          </div>

          <Separator />
          {connections.map((connection, index) => (
            <ConnectionContainer key={index}>
              <h4 style={{ textAlign: "center", marginBottom: "16px" }}>
                {t("connectionType")}
              </h4>
              <div>
                <Label htmlFor={`targetId_${index}`}>{t("targetId")}</Label>
                <Input
                  type="text"
                  id={`targetId_${index}`}
                  name="targetId"
                  value={connection.targetId}
                  onChange={(e) => handleConnectionChange(index, e)}
                  required
                  style={{ marginBottom: "24px" }} // Adjust margin for spacing
                />
              </div>
              <div>
                <Label htmlFor={`targetType_${index}`}>{t("targetType")}</Label>
                <Select
                  id={`targetType_${index}`}
                  name="targetType"
                  value={connection.targetType}
                  onChange={(e) => handleConnectionChange(index, e)}
                >
                  <option value="migrant">{t("migrant")}</option>
                  <option value="organization">{t("organization")}</option>
                </Select>
              </div>
              <div>
                <Label htmlFor={`strength_${index}`}>
                  {t("connectionStrength")}
                </Label>
                <Input
                  type="number"
                  id={`strength_${index}`}
                  name="strength"
                  value={connection.strength}
                  onChange={(e) => handleConnectionChange(index, e)}
                  required
                />
              </div>
              <div>
                <Label htmlFor={`type_${index}`}>{t("connectionType")}</Label>
                <Input
                  type="text"
                  id={`type_${index}`}
                  name="type"
                  value={connection.type}
                  onChange={(e) => handleConnectionChange(index, e)}
                  required
                />
              </div>
            </ConnectionContainer>
          ))}
          <AddConnectionButton type="button" onClick={addConnection}>
            {t("addConnection")}
          </AddConnectionButton>

          <Button type="submit">{t("submitNetwork")}</Button>
        </form>
      </NetworkBox>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 80vh; /* Adjust this value if necessary */
  background-color: #f3f4f6;
  padding: 40px 0; /* Add padding to the top and bottom */
`;

const NetworkBox = styled.div`
  background-color: ##e5e7eb;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 32px;
  width: 20rem;
  margin: 20px 0; /* Add margin to create space around the box */
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
  text-align: center;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  margin-bottom: 16px;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  margin-bottom: 16px;
  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.5);
  }
`;

const Button = styled.button`
  width: 100%;
  margin-top: 1.5rem;
  padding: 15px;
  background-color: #2d3748;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background-color: #2563eb;
  }
`;

const Separator = styled.hr`
  border: 1px solid #d1d5db; /* 구분선 색상 */
  margin: 16px 0; /* 위 아래 여백 */
`;

const ConnectionContainer = styled.div`
  margin-bottom: 20px;
  padding-bottom: 10px; /* Padding for better spacing */
  border-bottom: 1px solid #d1d5db; /* Add a bottom border */

  &:last-child {
    border-bottom: none; /* Remove the border for the last connection */
  }

  /* Add styles for centering and spacing */
  h4 {
    margin: 16px 0; /* Margin above and below the heading */
  }
`;

const AddConnectionButton = styled.button`
  width: 100%;
  margin-top: 1rem;
  padding: 10px;
  background-color: #4caf50;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  &:hover {
    background-color: #388e3c;
  }
`;

export default NetworkForm;
