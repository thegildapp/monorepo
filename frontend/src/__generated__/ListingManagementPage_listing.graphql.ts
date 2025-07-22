/**
 * @generated SignedSource<<550dca0a0f943f25493cf7da7e8f4f84>>
 * @lightSyntaxTransform
 * @nogrep
 */

/* tslint:disable */
/* eslint-disable */
// @ts-nocheck

import { ReaderFragment } from 'relay-runtime';
export type ListingStatus = "APPROVED" | "PENDING" | "REJECTED" | "%future added value";
import { FragmentRefs } from "relay-runtime";
export type ListingManagementPage_listing$data = {
  readonly city: string | null | undefined;
  readonly createdAt: string;
  readonly description: string;
  readonly id: string;
  readonly images: ReadonlyArray<string>;
  readonly price: number;
  readonly state: string | null | undefined;
  readonly status: ListingStatus;
  readonly title: string;
  readonly " $fragmentType": "ListingManagementPage_listing";
};
export type ListingManagementPage_listing$key = {
  readonly " $data"?: ListingManagementPage_listing$data;
  readonly " $fragmentSpreads": FragmentRefs<"ListingManagementPage_listing">;
};

const node: ReaderFragment = {
  "argumentDefinitions": [],
  "kind": "Fragment",
  "metadata": null,
  "name": "ListingManagementPage_listing",
  "selections": [
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "id",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "title",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "description",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "price",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "images",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "city",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "state",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "createdAt",
      "storageKey": null
    },
    {
      "alias": null,
      "args": null,
      "kind": "ScalarField",
      "name": "status",
      "storageKey": null
    }
  ],
  "type": "Listing",
  "abstractKey": null
};

(node as any).hash = "1a76ace6c8df31a8230a858e81d55708";

export default node;
