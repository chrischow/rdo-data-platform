// COMPONENT: DQ Assessment View
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import FileUploader from "./FileUploader";
import { useEffect, useState } from "react";
import MetadataForm from "./MetadataForm";
// import Modal from "./Modal";
import DatasetPanel from "./DatasetPanel";
import FeatureTable from "./FeatureTable";
import CustomRulesSection from "./CustomRulesSection";
import {
  checkCompleteness,
  checkInt,
  checkFloat,
  checkDate,
  checkBool,
  checkString
} from "../../utils/dqAssessment";

export default function AdHocView(props) {
  // State:
  // - data: object with (1) array of columns and (2) array of objects (data)
  // - featureColumns: object with columns as keys, and (a) data array and (b) metadata as values
  const [data, setData] = useState({});
  const [metadata, setMetadata] = useState([]);
  const [featureColumns, setFeatureColumns] = useState({});
  const [scoresDataset, setScoresDataset] = useState({});
  const [scoresFeatures, setScoresFeatures] = useState({});
  const [rules, setRules] = useState([]);
  const [showModal, setShowModal] = useState(false);

  // Handle modal
  const handleCloseModal = () => setShowModal(false);
  const handleShowModal = () => setShowModal(true);

  // Create feature columns upon update of CSV file and metadata
  useEffect(() => {
    if (Object.keys(data).length > 0 && Object.keys(metadata).length > 0) {
      var newData = {};
      for (var column of data.columns) {
        newData = {
          ...newData,
          [column]: {
            data: data.data.map((row) => row[column]),
            metadata: metadata.filter((item) => item.name === column)[0],
          },
        };
      }

      setFeatureColumns((prevData) => {
        return {
          ...prevData,
          ...newData,
        };
      });
    }
  }, [data, metadata]);

  // Calculate data quality metrics
  useEffect(() => {
    // Compute data quality for individual features
    if (Object.keys(featureColumns).length > 0) {
      const columns = Object.keys(featureColumns);

      // Variables for loop
      var feature;
      var featureData;
      var newData = {};
      var fn;

      var completeness, consistency, uniqueness;

      var overallCompleteness = 0;
      var overallConsistency = 0;
      var overallUniqueness = 0;
      var overallNonNull = 0;

      for (var column of columns) {
        feature = featureColumns[column];
        featureData = feature.data.filter((val) => {
          return val == null || val == "" ? false : true;
        });

        if (feature.metadata.dataType === "float") {
          fn = checkFloat;
        } else if (feature.metadata.dataType === "date") {
          fn = checkDate;
        } else if (feature.metadata.dataType === 'integer') {
          fn = checkInt;
        } else if (feature.metadata.dataType === 'boolean') {
          fn = checkBool;
        } else {
          fn = checkString;
        }

        // Compute metrics
        completeness = feature.data.reduce(
          (a, b) => a + checkCompleteness(b),
          0
        );
        consistency = featureData.reduce((a, b) => a + fn(b), 0);
        uniqueness = new Set(featureData).size;

        // Append metrics
        overallCompleteness += completeness;
        overallConsistency += consistency;
        overallUniqueness += uniqueness;
        overallNonNull += featureData.length;

        // Prepare column data quality scores
        newData = {
          ...newData,
          [column]: {
            completeness: completeness / feature.data.length,
            consistency: consistency / featureData.length,
            uniqueness: uniqueness / featureData.length,
          },
        };
      }

      setScoresFeatures((prevData) => {
        return {
          ...prevData,
          ...newData,
        };
      });

      // Compute data quality for dataset
      const nColumns = data.columns.length;
      const nRows = data.data.length;
      const totalCells = data.columns.length * data.data.length;
      const totalValidCells = overallNonNull;

      setScoresDataset({
        nColumns,
        nRows,
        totalCells,
        totalValidCells,
        overallCompleteness,
        overallConsistency,
        overallUniqueness,
      });
    }
  }, [featureColumns]);

  // Function to render file uploader and metadata form
  const renderUploader = (modalId) => {
    return (
      <div>
        <FileUploader setData={setData} />
        {data.columns && (
          <MetadataForm
            columns={data.columns}
            setMetadata={setMetadata}
            modalId={modalId}
          />
        )}
      </div>
    );
  };

  return (
    <div>
      <h1>Data Quality Assessment Tool</h1>
      <p>
        Upload your dataset (CSV file) to get an ad hoc data quality assessment.
        Results <strong>will not be saved</strong> - you will lose all progress when navigating away from this page.
      </p>
      <div className="section-upload">
        <Button variant="primary" className="btn-green" onClick={handleShowModal}>
          {`${data.columns ? "Edit" : "Upload"} Data`}
        </Button>
        
        <Modal show={showModal} onHide={handleCloseModal} size="xl" id="dqModal">
          <Modal.Header closeButton>
            <Modal.Title>{`${data.columns ? "Edit" : "Upload"} Data`}</Modal.Title>
          </Modal.Header>
          <Modal.Body className="mb-5">
            <FileUploader setData={setData} />
            {data.columns && (
              <MetadataForm
                columns={data.columns}
                metadata={metadata}
                setMetadata={setMetadata}
                handleCloseModal={handleCloseModal}
                modalId="dqModal"
              />
            )}
          </Modal.Body>
        </Modal>
      </div>
      <div className="section-overview mt-4">
        {Object.keys(scoresFeatures).length > 0 && (
          <DatasetPanel scoresDataset={scoresDataset} />
        )}
      </div>
      <div className="section-table mt-4">
        {Object.keys(scoresFeatures).length > 0 && (
          <FeatureTable scoresFeatures={scoresFeatures} metadata={metadata} />
        )}
      </div>
      <div className="mt-4">
        {Object.keys(scoresFeatures).length > 0 && (
          <CustomRulesSection
            featureColumns={featureColumns}
            metadata={metadata}
            rules={rules}
            setRules={setRules}
          />
        )}
      </div>
    </div>
  );
}
