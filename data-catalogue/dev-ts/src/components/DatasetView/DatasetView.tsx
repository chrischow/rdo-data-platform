import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { FaDatabase } from 'react-icons/fa';
import { DomainIcon } from '../DomainIcon/DomainIcon';
import { TableCard } from '../TableCard/TableCard';
import { DatasetSchema, TableSchema } from '../../utils/utils';
import { useTableByDataset } from '../../hooks/useTables';
import { useDataset } from '../../hooks/useDatasets';
import './DatasetView.css';

export const DatasetView: React.FC = () => {
  // Get ID
  const params = useParams();

  // Get data
  const dataset: DatasetSchema = useDataset(Number(params.id));
  const { tables, tablesIsSuccess } = useTableByDataset(Number(params.id));

  return (
    <div>
      {dataset &&
        <>
          <h1 className="datasetview--title d-flex align-items-center">
            <FaDatabase style={{ color: '#7B73F0', marginRight: '10px' }} />
            {dataset.Title}
          </h1>
          <div className="mt-5">
            <table className="table">
              <tbody>
                <tr>
                  <td width="25%" className="dataset-metadata--header infotable--cell">Use Cases</td>
                  <td className="infotable--cell">{dataset.useCases}</td>
                </tr>
                <tr>
                  <td className="dataset-metadata--header infotable--cell">Owner</td>
                  <td className="infotable--cell">{dataset.owner}</td>
                </tr>
                <tr>
                  <td className="dataset-metadata--header infotable--cell">Point of Contact</td>
                  <td className="infotable--cell">{dataset.pointOfContact}</td>
                </tr>
                <tr>
                  <td className="dataset-metadata--header infotable--cell">Domain</td>
                  <td className="infotable--cell">
                    <Link className="domain-link d-flex align-items-center" to={`/${dataset.dataDomain}`}>
                      <DomainIcon dataDomain={dataset.dataDomain} styleParams={{ marginRight: '5px' }} />
                      {dataset.dataDomain}
                    </Link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      }

      <div className="mt-5">
        <h2>Tables</h2>
        <div className="mt-4">
          {tablesIsSuccess &&
            tables.map((table: TableSchema) => {
              return <TableCard key={table.Title} {...table} />
            })
          }
        </div>
      </div>
    </div>
  );
}