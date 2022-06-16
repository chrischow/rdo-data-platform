import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Nav from 'react-bootstrap/Nav';
import Tab from 'react-bootstrap/Tab';
import { BsTable, BsKeyFill } from 'react-icons/bs';
import { BiColumns, BiCard } from 'react-icons/bi';
import { FaDatabase } from 'react-icons/fa';
import TermPopover from '../TermPopover/TermPopover';
import ColumnCard from '../ColumnCard/ColumnCard';
import SearchBar from '../SearchBar/SearchBar';
import { getListItems } from '../../utils/queryData';
import { filterColumns } from '../../utils/processData';
import { config } from '../../config';
import './TableView.css';

export default function TableView(props) {
  // Get ID
  const params = useParams();

  // Set state
  const [columns, setColumns] = useState([]);
  const [table, setTable] = useState([]);
  const [terms, setTerms] = useState([]);
  const [keywords, setKeywords] = useState('');

  // Function to set dataset - expect an array of length 1
  const extractTable = (arr) => {
    setTable(arr[0]);
  };

  // Initial load of data
  useEffect(() => {
    // Get tables and columns
    getListItems(
      config.columnListId,
      'Id,Title,columnDescription,dataType,businessRules,isPrimaryKey,isForeignKey,codeTable,relatedFactTable,parentTable/Id,parentTable/Title,businessTerm/Id,businessTerm/Title',
      `parentTable/Id eq ${params.id}`,
      'parentTable,businessTerm',
      setColumns
    );

    getListItems(
      config.tableListId,
      'Id,Title,tableDescription,updateFrequency,site,guid0,parentDataset/Id,parentDataset/Title',
      `Id eq ${params.id}`,
      'parentDataset',
      extractTable
    );
  }, []);

  useEffect(() => {
    if (columns) {
      // Get business terms
      getListItems(
        config.businessTermListId,
        'Id,Title,definition,businessRules,source',
        '',
        '',
        setTerms
      );
    }
  }, [columns])

  return (
    <div>
      {table &&
        <h1 className="datasetview--title d-flex align-items-center">
          <BsTable style={{ color: '#1ebfaf', marginRight: '10px' }} />
          {table.Title}
        </h1>
      }
      <div className="mt-5">
        <table className="table">
          {table && <tbody>
            <tr>
              <td width="25%" className="table-metadata--header infotable--cell">Description</td>
              <td className="infotable--cell">{table.tableDescription}</td>
            </tr>
            <tr>
              <td className="table-metadata--header infotable--cell">Update Frequency</td>
              <td className="infotable--cell">{table.updateFrequency}</td>
            </tr>
            <tr>
              <td className="table-metadata--header infotable--cell">Site</td>
              <td className="infotable--cell">{table.site}</td>
            </tr>
            <tr>
              <td className="table-metadata--header infotable--cell">ID</td>
              <td className="infotable--cell">{table.guid0}</td>
            </tr>
            <tr>
              <td className="table-metadata--header infotable--cell">Dataset</td>
              <td className="infotable--cell">
                <Link className="dataset-link d-flex align-items-center" to={`/dataset/${table.parentDataset_Id}`}>
                  <FaDatabase className="inline" style={{ marginRight: '5px' }} />
                  {table.parentDataset_Title}
                </Link>
              </td>
            </tr>
          </tbody>}
        </table>
      </div>

      <div className="mt-5">
        <h2>Columns</h2>
                
        <div className="mt-2">
          <SearchBar placeholder="Search for columns..." updateSearch={setKeywords} />
        </div>
        <div className="mt-2">
          <Tab.Container id="search-results-tabs" defaultActiveKey="table">
            <Row className="justify-content-end align-items-end">
              <Col xs={6}>
                <div className="key-legend">
                  <table style={{display: 'inline-block'}}>
                    <tbody>
                      <tr>
                        <td width="40px"><BsKeyFill alt="Primary Key" style={{ color: '#F0C419', marginLeft: '7px' }} /></td>
                        <td><small>Primary Key</small></td>
                      </tr>
                      <tr>
                        <td width="40px"><BsKeyFill alt="Primary Key" style={{ color: '#FF5364', marginLeft: '7px' }} /></td>
                        <td><small>Foreign Key</small></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </Col>
              <Col xs={6}>
                <div className="columnview-switch">
                  <Nav variant="pills" defaultActiveKey="table">
                    <Nav.Item>
                      <Nav.Link eventKey="table" className="columnview-switch-button switch-left d-flex align-items-center">
                        <BiColumns />
                      </Nav.Link>
                    </Nav.Item>
                    <Nav.Item>
                      <Nav.Link eventKey="cards" className="columnview-switch-button switch-right d-flex align-items-center">
                        <BiCard />
                      </Nav.Link>
                    </Nav.Item>
                  </Nav>
                </div>
              </Col>
            </Row>
            <div className="mt-4">
              <Tab.Content>
                <Tab.Pane eventKey="table">
                  <Table striped responsive className="table column-table">
                    <thead className="table-dark">
                      <tr>
                        <th>Title</th>
                        <th>Description</th>
                        <th>Data Type</th>
                        <th>Business Rules</th>
                        <th>Business Term</th>
                      </tr>
                    </thead>
                    <tbody>
                      {columns && (terms.length > 0) &&
                        filterColumns(columns, keywords).map(col => {
                          const termList = col.businessTerm;
                          for (let i=0; i < termList.length; i++) {
                            let currentTerm = terms.find(t => t.Id === termList[i].Id);
                            termList[i]['definition'] = currentTerm.definition ? currentTerm.definition : '';
                          }
                          return (
                            <tr key={col.Title}>
                              <td>
                                {col.Title}
                                {col.isPrimaryKey ?
                                  <BsKeyFill alt="Primary Key" style={{ color: '#F0C419', marginLeft: '7px' }} /> :
                                  ''}
                                {col.isForeignKey ?
                                  <BsKeyFill alt="Foreign Key" style={{ color: '#FF5364', marginLeft: '7px' }} /> :
                                  ''}
                              </td>
                              <td>{col.columnDescription}</td>
                              <td className="datatype-cell">{col.dataType}</td>
                              <td>{col.businessRules}</td>
                              <td>
                                {termList.length > 0 && termList.map(term => {
                                  return <TermPopover key={`popover-${col.Id}-${term.Id}`} {...term} />
                                })}
                              </td>
                            </tr>
                          );
                        })
                      }
                    </tbody>
                  </Table>
                </Tab.Pane>

                <Tab.Pane eventKey="cards">
                {columns &&
                  filterColumns(columns, keywords).map(col => {
                    const termList = col.businessTerm;
                    for (let i=0; i < termList.length; i++) {
                      let currentTerm = terms.find(t => t.Id === termList[i].Id);
                      if (currentTerm && currentTerm.definition) {
                        termList[i]['definition'] = currentTerm.definition;
                      } else {
                        termList[i]['definition'] = '';
                      }
                    }
                    return <ColumnCard key={`card-${col.Id}`} {...col} termList={termList} />
                  })
                }
                </Tab.Pane>
              </Tab.Content>
            </div>
          </Tab.Container>
        </div>


        <div className="mt-5">
          {columns.length > 0 && filterColumns(columns, keywords).length === 0 &&
            <div className="text-center">
              <h4 style={{ fontWeight: 'normal' }}>No results match your search criteria "<em>{keywords}</em>".</h4>
            </div>
          }

          {columns.length === 0 &&
            <div className="text-center">
              <h3>No datasets available.</h3>
            </div>
          }
        </div>
      </div>
    </div>

  );
}