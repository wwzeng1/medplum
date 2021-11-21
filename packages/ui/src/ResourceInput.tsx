import { Bundle, BundleEntry, Operator, Reference, Resource } from '@medplum/core';
import React, { useRef } from 'react';
import { useResource } from '.';
import { Autocomplete } from './Autocomplete';
import { Avatar } from './Avatar';
import { useMedplum } from './MedplumProvider';
import { ResourceName } from './ResourceName';

export interface ResourceInputProps<T extends Resource = Resource> {
  readonly resourceType: string;
  readonly name: string;
  readonly defaultValue?: T | Reference<T>;
  readonly className?: string;
  readonly placeholder?: string;
  readonly onChange?: (value: T) => void;
}

export function ResourceInput<T extends Resource = Resource>(props: ResourceInputProps<T>) {
  const medplum = useMedplum();
  const defaultResource = useResource(props.defaultValue);

  const resourceTypeRef = useRef<string>(props.resourceType);
  resourceTypeRef.current = props.resourceType;

  return (
    <Autocomplete
      loadOptions={(input: string): Promise<T[]> => {
        return medplum.search({
          resourceType: resourceTypeRef.current,
          filters: [{
            code: 'name',
            operator: Operator.EQUALS,
            value: input
          }]
        })
          .then((bundle: Bundle) => (bundle.entry as BundleEntry[]).map(entry => entry.resource as T));
      }}
      getId={(item: T) => {
        return item.id as string;
      }}
      getIcon={(item: T) => <Avatar value={item} />}
      getDisplay={(item: T) => <ResourceName value={item} />}
      getHelpText={(item: T) => {
        if (item.resourceType === 'Patient' && item.birthDate) {
          return 'DoB: ' + item.birthDate;
        }
        return undefined;
      }}
      name={props.name}
      defaultValue={defaultResource ? [defaultResource] : undefined}
      className={props.className}
      placeholder={props.placeholder}
      onChange={(items: T[]) => {
        if (items.length > 0) {
          if (props.onChange) {
            props.onChange(items[0]);
          }
        }
      }}
    />
  );
}