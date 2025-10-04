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

declare module '@/services/evenementsService/actionsPassives' {
    export declare function createPassiveAction(
        action_id: number,
        params: any,
        repeat_every: number,
        repeat_unit: string,
        date_debut: string,
        date_fin?: string | null
    ): Promise<{ status: boolean, message: string }>;

    export declare function deletePassiveAction(action_passive_id: number): Promise<{ status: boolean, message: string }>;

    export declare function syncPassiveActions(): Promise<{ status: boolean, message: string }>;
}