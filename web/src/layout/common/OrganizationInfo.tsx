import classnames from 'classnames';
import isUndefined from 'lodash/isUndefined';
import React, { useEffect, useRef, useState } from 'react';
import { MdBusiness } from 'react-icons/md';
import { useHistory } from 'react-router-dom';

import API from '../../api';
import useOutsideClick from '../../hooks/useOutsideClick';
import { Organization } from '../../types';
import { prepareQueryString } from '../../utils/prepareQueryString';
import ExternalLink from './ExternalLink';
import Image from './Image';
import styles from './OrganizationInfo.module.css';

interface Props {
  organizationName: string;
  organizationDisplayName?: string | null;
  deprecated?: null | boolean;
  className?: string;
  btnClassName?: string;
  visibleLegend: boolean;
  multiLine?: boolean;
}

const FETCH_DELAY = 1 * 100; // 100ms

const OrganizationInfo = (props: Props) => {
  const history = useHistory();
  const ref = useRef(null);
  const [organization, setOrganization] = useState<Organization | null | undefined>(undefined);
  const [openStatus, setOpenStatus] = useState(false);
  const [onLinkHover, setOnLinkHover] = useState(false);
  const [onDropdownHover, setOnDropdownHover] = useState(false);
  const [fetchTimeout, setFetchTimeout] = useState<NodeJS.Timeout | null>(null);
  useOutsideClick([ref], openStatus, () => setOpenStatus(false));

  async function fetchOrganization() {
    try {
      setOrganization(await API.getOrganization(props.organizationName));
    } catch (err) {
      setOrganization(null);
    }
  }

  const openOrgInfo = () => {
    if (isUndefined(organization)) {
      setFetchTimeout(
        setTimeout(() => {
          fetchOrganization();
        }, FETCH_DELAY)
      );
    }
  };

  const cleanFetchTimeout = () => {
    if (fetchTimeout) {
      clearTimeout(fetchTimeout);
    }
  };

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (organization && !openStatus && (onLinkHover || onDropdownHover)) {
      timeout = setTimeout(() => {
        setOpenStatus(true);
      }, 100);
    }
    if (openStatus && !onLinkHover && !onDropdownHover) {
      timeout = setTimeout(() => {
        // Delay to hide the dropdown to avoid hide it if user changes from link to dropdown
        setOpenStatus(false);
      }, 50);
    }

    return () => {
      if (!isUndefined(timeout)) {
        clearTimeout(timeout);
      }
      cleanFetchTimeout();
    };
  }, [onLinkHover, onDropdownHover, organization, openStatus]); /* eslint-disable-line react-hooks/exhaustive-deps */

  return (
    <div className={props.className}>
      <div className="position-absolute">
        <div
          ref={ref}
          role="complementary"
          className={classnames('dropdown-menu dropdown-menu-left', styles.dropdown, {
            show: openStatus,
          })}
          onMouseEnter={() => setOnDropdownHover(true)}
          onMouseLeave={() => setOnDropdownHover(false)}
        >
          {organization && (
            <div className={styles.content}>
              <div className="d-flex flex-row align-items-center">
                <div
                  className={`d-flex align-items-center justify-content-center overflow-hidden mr-2 p-1 position-relative ${styles.imageWrapper} imageWrapper`}
                >
                  {organization.logoImageId ? (
                    <Image
                      alt={organization.displayName || organization.name}
                      imageId={organization.logoImageId}
                      className={styles.image}
                      placeholderIcon={<MdBusiness />}
                    />
                  ) : (
                    <MdBusiness className={styles.image} />
                  )}
                </div>

                <div>
                  <h6 className="mb-0">{organization.displayName || organization.name}</h6>
                </div>
              </div>

              {organization.homeUrl && (
                <div className="mt-1 text-truncate d-flex flex-row align-items-baseline">
                  <small className="text-muted text-uppercase mr-1">Homepage: </small>
                  <ExternalLink
                    href={organization.homeUrl}
                    className={`text-reset text-truncate ${styles.externalLink}`}
                    label={`Open link ${organization.homeUrl}`}
                    btnType
                  >
                    <div className="text-truncate">{organization.homeUrl}</div>
                  </ExternalLink>
                </div>
              )}

              {organization.description && (
                <div className={`mt-2 text-muted ${styles.description}`}>{organization.description}</div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="d-flex flex-row aling-items-start text-truncate">
        {props.visibleLegend && (
          <div className="d-flex flex-row align-items-baseline mr-1 text-muted text-uppercase">
            <small>Org:</small>
          </div>
        )}

        <button
          className={`p-0 border-0 text-dark text-truncate flex-grow-1 ${styles.link} ${props.btnClassName}`}
          onClick={(e) => {
            e.preventDefault();
            history.push({
              pathname: '/packages/search',
              search: prepareQueryString({
                pageNumber: 1,
                filters: {
                  org: [props.organizationName!],
                },
                deprecated: props.deprecated,
              }),
            });
          }}
          onMouseEnter={(e) => {
            e.preventDefault();
            setOnLinkHover(true);
            openOrgInfo();
          }}
          onMouseLeave={() => {
            setFetchTimeout(null);
            cleanFetchTimeout();
            setOnLinkHover(false);
          }}
          aria-label="Organization info"
          aria-expanded={openStatus}
          aria-hidden="true"
          tabIndex={-1}
        >
          <div
            className={classnames({
              'text-truncate': isUndefined(props.multiLine) || !props.multiLine,
            })}
          >
            {props.organizationDisplayName || props.organizationName}
          </div>
        </button>
      </div>
    </div>
  );
};

export default OrganizationInfo;
