import { isEmpty } from 'lodash';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { HiClipboardList } from 'react-icons/hi';
import { useHistory } from 'react-router-dom';

import API from '../../../api';
import { SearchFiltersURL, SecurityReport, SecurityReportSummary } from '../../../types';
import alertDispatcher from '../../../utils/alertDispatcher';
import isFuture from '../../../utils/isFuture';
import Modal from '../../common/Modal';
import styles from './Modal.module.css';
import SecuritySummary from './Summary';
import SummaryTable from './SummaryTable';
import SecurityTable from './Table';

interface Props {
  summary: SecurityReportSummary;
  totalVulnerabilities: number;
  packageId: string;
  version: string;
  createdAt?: number;
  visibleSecurityReport: boolean;
  eventId?: string;
  searchUrlReferer?: SearchFiltersURL;
  fromStarredPage?: boolean;
  hasWhitelistedContainers: boolean;
}

const SecurityModal = (props: Props) => {
  const history = useHistory();
  const [currentVersion, setCurrentVersion] = useState<string>(props.version);
  const [currentPkgId, setCurrentPkgId] = useState<string>(props.packageId);
  const [openStatus, setOpenStatus] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [report, setReport] = useState<SecurityReport | null | undefined>();
  const [expandedTarget, setExpandedTarget] = useState<string | null>(null);
  const [hasOnlyOneTarget, setHasOnlyOneTarget] = useState<boolean>(false);

  const activateTargetWhenIsOnlyOne = (report: SecurityReport) => {
    const images = Object.keys(report);
    if (images.length === 1) {
      const results = report[images[0]].Results;
      if (
        results.length === 1 &&
        report[images[0]].Results[0].Vulnerabilities &&
        report[images[0]].Results[0].Vulnerabilities!.length > 0
      ) {
        setExpandedTarget(`${images[0]}_${report[images[0]].Results[0].Target}`);
        setHasOnlyOneTarget(true);
      }
    }
  };

  async function getSecurityReports(eventId?: string) {
    try {
      setIsLoading(true);
      const report = await API.getSnapshotSecurityReport(props.packageId, props.version, eventId);
      setReport(report);
      activateTargetWhenIsOnlyOne(report);
      setCurrentPkgId(props.packageId);
      setCurrentVersion(props.version);
      setIsLoading(false);
      setOpenStatus(true);
    } catch {
      setReport(null);
      alertDispatcher.postAlert({
        type: 'danger',
        message: 'An error occurred getting the vulnerability reports, please try again later.',
      });
      setIsLoading(false);
    }
  }

  const onOpenModal = () => {
    if (report && props.version === currentVersion && props.packageId === currentPkgId) {
      setOpenStatus(true);
    } else {
      getSecurityReports(props.eventId); // Send eventId, if defined, from security alert email
    }
    history.replace({
      search: '?modal=security-report',
      state: { searchUrlReferer: props.searchUrlReferer, fromStarredPage: props.fromStarredPage },
    });
  };

  const onCloseModal = () => {
    setOpenStatus(false);
    setExpandedTarget(null);
    history.replace({
      search: '',
      state: { searchUrlReferer: props.searchUrlReferer, fromStarredPage: props.fromStarredPage },
    });
  };

  useEffect(() => {
    if (props.visibleSecurityReport && !openStatus) {
      onOpenModal();
    }
  }, []); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <>
      <div>
        {props.createdAt && !isFuture(props.createdAt) && (
          <div className={`my-2 ${styles.created}`}>
            <small className="text-uppercase text-muted">Last scan: </small> {moment.unix(props.createdAt).fromNow()}
          </div>
        )}

        <button className="btn btn-outline-secondary btn-sm" onClick={onOpenModal} aria-label="Open full report modal">
          <small className="d-flex flex-row align-items-center text-uppercase">
            {isLoading ? (
              <>
                <span className="spinner-grow spinner-grow-sm" role="status" aria-hidden="true" />
                <span className="ml-2">Getting report...</span>
              </>
            ) : (
              <>
                <HiClipboardList className="mr-2" />
                <span>Open full report</span>
              </>
            )}
          </small>
        </button>
      </div>

      {openStatus && report && (
        <Modal
          modalDialogClassName={styles.modalDialog}
          modalClassName="h-100"
          header={<div className={`h3 m-2 flex-grow-1 ${styles.title}`}>Security report</div>}
          onClose={onCloseModal}
          open={openStatus}
          breakPoint="md"
        >
          <div className="m-3">
            <div className="h5 mt-0 text-dark text-uppercase font-weight-bold pb-2">Summary</div>
            {props.totalVulnerabilities > 0 && (
              <>
                <SummaryTable report={report} hasWhitelistedContainers={props.hasWhitelistedContainers} />
              </>
            )}

            <SecuritySummary summary={props.summary} totalVulnerabilities={props.totalVulnerabilities} />

            {!isEmpty(report) && (
              <>
                <div className="h5 pt-3 text-dark text-uppercase font-weight-bold pb-3">Vulnerabilities details</div>
                <div className="mt-3">
                  {Object.keys(report).map((image: string) => {
                    return (
                      <SecurityTable
                        image={image}
                        reports={report[image].Results}
                        key={`image_${image}`}
                        expandedTarget={expandedTarget}
                        setExpandedTarget={setExpandedTarget}
                        hasOnlyOneTarget={hasOnlyOneTarget}
                      />
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </Modal>
      )}
    </>
  );
};

export default SecurityModal;
