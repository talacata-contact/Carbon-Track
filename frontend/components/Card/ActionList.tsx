/*
Copyright © 2025 TALACATA.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

        http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import ActionCard from '@/components/Card/ActionCard';
import { getActionById } from '@/services/evenementsService/actions';
import { getReferenceById } from '@/services/evenementsService/actionsReferences';
import React from 'react';
import { ScrollView, Text } from 'react-native';

type Props = {
  iterations: any[];
  objectif?: [boolean, number];
};

export default function ActionList({ iterations, objectif }: Props) {
  const [enriched, setEnriched] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const enrichData = async () => {
      try {
        const result: any[] = [];
        for (const iter of iterations) {
          let action = await getActionById(iter.action_id);

          if (action) {
            let referenceId;
            switch (action.categorie) {
              case 'logement':
                referenceId = action.logement_id;
                break;
              case 'transport':
                referenceId = action.transport_id;
                break;
              case 'aliment':
                referenceId = action.aliment_code;
                break;
              default:
                referenceId = null;
            }

            const reference = referenceId
              ? await getReferenceById(action.categorie, referenceId)
              : null;

            result.push({
              actionDetails: {
                nom: action.nom,
                type_action: action.type_action,
                categorie: action.categorie,
                params: iter.params,
                date: iter.date,
                co2: iter.co2,
              },
              action,
              reference,
              iterId: iter.iterId,
            });
          }
        }
        setEnriched(result);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    enrichData();
  }, [iterations]);

  if (loading) return <Text>Chargement...</Text>;
  if (error) return <Text style={{ color: 'red' }}>{error}</Text>;

  return (
    <ScrollView>
      {enriched.map(({ action, reference, actionDetails, iterId }, idx) => (
        <ActionCard
          key={iterId ?? `${action.id}-${idx}`} // fallback to unique string if iterId is missing
          action={action}
          reference={reference}
          actionDetails={actionDetails}
          objectif={objectif}
        />
      ))}
    </ScrollView>
  );
}