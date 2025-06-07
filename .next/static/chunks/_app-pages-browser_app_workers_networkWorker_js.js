/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "(app-pages-browser)/./app/workers/networkWorker.js":
/*!**************************************!*\
  !*** ./app/workers/networkWorker.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

eval(__webpack_require__.ts("/* eslint-disable no-restricted-globals */ // 네트워크 필터링 및 중심성 계산 워커\n// export type Network = {\n//   id: number\n//   nationality: string\n//   ethnicity: string\n//   migration_year: number\n//   user_name: string\n//   type: string\n//   edges: { edgeType: string; targetId: number }[]\n//   migration_traces: { reason: string }[]\n// }\n// export type FilterOptions = {\n//   nationality: string[] | string\n//   ethnicity: string[] | string\n//   edgeType: string[] | string\n//   entityType: string\n//   yearRange: [number, number]\n//   migrationYearRange: [number, number] // 추가\n//   userNetworkFilter: boolean\n//   userNetworkTraceFilter: boolean\n//   userNetworkConnectionFilter: boolean\n//   migrationReasons: string[]\n//   selectedMigrationNetworkId: number | null\n// }\nfunction filterNetworks(networks, filters, selectedEdgeId, userName) {\n    var total = networks.length;\n    var filtered = [];\n    self.postMessage({\n        type: \"PROGRESS\",\n        payload: 0\n    });\n    networks.forEach(function(network, idx) {\n        // 국적 필터\n        var matchesNationality = filters.nationality.includes(\"all\") || filters.nationality.includes(network.nationality) || filters.nationality === \"all\" || network.nationality === filters.nationality;\n        // 민족 필터\n        var matchesEthnicity = filters.ethnicity.includes(\"all\") || filters.ethnicity.includes(network.ethnicity) || filters.ethnicity === \"all\" || network.ethnicity === filters.ethnicity;\n        // 연도 필터\n        var matchesYearRange = network.migration_year >= filters.yearRange[0] && network.migration_year <= filters.yearRange[1];\n        // 이동연도(이주연도) 필터: migration_traces 중 하나라도 migrationYearRange에 포함되면 통과\n        var matchesMigrationYearRange = !filters.migrationYearRange || filters.migrationYearRange.length !== 2 || network.migration_traces.some(function(trace) {\n            return trace.migration_year >= filters.migrationYearRange[0] && trace.migration_year <= filters.migrationYearRange[1];\n        });\n        // 유저 네트워크 필터\n        var matchesUserNetwork = !filters.userNetworkFilter || !userName || network.user_name === userName;\n        // 엣지 필터\n        var matchesEdge = !selectedEdgeId || network.edges.some(function(edge) {\n            return edge.targetId === selectedEdgeId;\n        });\n        // 엔티티 타입 필터\n        var matchesEntityType = filters.entityType === \"all\" || (Array.isArray(filters.entityType) ? filters.entityType.includes(\"all\") || filters.entityType.includes(network.type) : network.type === filters.entityType);\n        // 엣지 타입 필터 (멀티 지원)\n        var matchesEdgeType = true;\n        if (filters.edgeType && filters.edgeType.length > 0 && !filters.edgeType.includes(\"all\")) {\n            matchesEdgeType = network.edges.some(function(edge) {\n                return Array.isArray(filters.edgeType) ? filters.edgeType.includes(edge.edgeType) : filters.edgeType === edge.edgeType;\n            });\n        }\n        // 이주 원인 필터\n        var matchesMigrationReasons = filters.migrationReasons.includes(\"all\") || filters.migrationReasons.length === 0 || network.migration_traces.some(function(trace) {\n            return filters.migrationReasons.includes(trace.reason);\n        });\n        // 여러 네트워크 필터\n        var matchesSelectedMigrationNetworks = !filters.selectedMigrationNetworkIds || filters.selectedMigrationNetworkIds.length === 0 || filters.selectedMigrationNetworkIds.includes(network.id);\n        var matches = matchesNationality && matchesEthnicity && matchesYearRange && matchesMigrationYearRange && matchesUserNetwork && matchesEdge && matchesEntityType && matchesMigrationReasons && matchesSelectedMigrationNetworks && matchesEdgeType // 추가\n        ;\n        if (matches) filtered.push(network);\n        // 5% 단위로 진행률 메시지 전송 (혹은 100개마다 등)\n        if (idx % Math.ceil(total / 20) === 0 || idx === total - 1) {\n            var percent = Math.round((idx + 1) / total * 100);\n            self.postMessage({\n                type: \"PROGRESS\",\n                payload: percent\n            });\n        }\n    });\n    return filtered;\n}\n// 중심성 계산 (예시: degree centrality)\nfunction calculateCentrality(filteredNetworks, centralityType) {\n    var centrality = {};\n    if (centralityType === \"degree\") {\n        filteredNetworks.forEach(function(network) {\n            centrality[network.id] = network.edges.length;\n        });\n    } else if (centralityType === \"none\") {\n        filteredNetworks.forEach(function(network) {\n            centrality[network.id] = 1;\n        });\n    }\n    // 필요시 다른 중심성도 추가\n    return centrality;\n}\nself.onmessage = function(e) {\n    var _e_data = e.data, type = _e_data.type, payload = _e_data.payload;\n    if (type === \"FILTER_NETWORKS\") {\n        self.postMessage({\n            type: \"PROGRESS\",\n            payload: 0\n        }) // 반드시 0부터 시작!\n        ;\n        var filtered = filterNetworks(payload.networks, payload.filters, payload.selectedEdgeId, payload.userName);\n        self.postMessage({\n            type: \"FILTERED_NETWORKS\",\n            payload: filtered\n        });\n        self.postMessage({\n            type: \"PROGRESS\",\n            payload: 100\n        }) // 마지막에 100!\n        ;\n    }\n    if (type === \"CALCULATE_CENTRALITY\") {\n        var filteredNetworks = payload.filteredNetworks, centralityType = payload.centralityType;\n        var result = calculateCentrality(filteredNetworks, centralityType);\n        self.postMessage({\n            type: \"CENTRALITY_RESULT\",\n            payload: result\n        });\n    }\n};\n\n\n;\n    // Wrapped in an IIFE to avoid polluting the global scope\n    ;\n    (function () {\n        var _a, _b;\n        // Legacy CSS implementations will `eval` browser code in a Node.js context\n        // to extract CSS. For backwards compatibility, we need to check we're in a\n        // browser context before continuing.\n        if (typeof self !== 'undefined' &&\n            // AMP / No-JS mode does not inject these helpers:\n            '$RefreshHelpers$' in self) {\n            // @ts-ignore __webpack_module__ is global\n            var currentExports = module.exports;\n            // @ts-ignore __webpack_module__ is global\n            var prevSignature = (_b = (_a = module.hot.data) === null || _a === void 0 ? void 0 : _a.prevSignature) !== null && _b !== void 0 ? _b : null;\n            // This cannot happen in MainTemplate because the exports mismatch between\n            // templating and execution.\n            self.$RefreshHelpers$.registerExportsForReactRefresh(currentExports, module.id);\n            // A module can be accepted automatically based on its exports, e.g. when\n            // it is a Refresh Boundary.\n            if (self.$RefreshHelpers$.isReactRefreshBoundary(currentExports)) {\n                // Save the previous exports signature on update so we can compare the boundary\n                // signatures. We avoid saving exports themselves since it causes memory leaks (https://github.com/vercel/next.js/pull/53797)\n                module.hot.dispose(function (data) {\n                    data.prevSignature =\n                        self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports);\n                });\n                // Unconditionally accept an update to this module, we'll check if it's\n                // still a Refresh Boundary later.\n                // @ts-ignore importMeta is replaced in the loader\n                module.hot.accept();\n                // This field is set when the previous version of this module was a\n                // Refresh Boundary, letting us know we need to check for invalidation or\n                // enqueue an update.\n                if (prevSignature !== null) {\n                    // A boundary can become ineligible if its exports are incompatible\n                    // with the previous exports.\n                    //\n                    // For example, if you add/remove/change exports, we'll want to\n                    // re-execute the importing modules, and force those components to\n                    // re-render. Similarly, if you convert a class component to a\n                    // function, we want to invalidate the boundary.\n                    if (self.$RefreshHelpers$.shouldInvalidateReactRefreshBoundary(prevSignature, self.$RefreshHelpers$.getRefreshBoundarySignature(currentExports))) {\n                        module.hot.invalidate();\n                    }\n                    else {\n                        self.$RefreshHelpers$.scheduleUpdate();\n                    }\n                }\n            }\n            else {\n                // Since we just executed the code for the module, it's possible that the\n                // new exports made it ineligible for being a boundary.\n                // We only care about the case when we were _previously_ a boundary,\n                // because we already accepted this update (accidental side effect).\n                var isNoLongerABoundary = prevSignature !== null;\n                if (isNoLongerABoundary) {\n                    module.hot.invalidate();\n                }\n            }\n        }\n    })();\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKGFwcC1wYWdlcy1icm93c2VyKS8uL2FwcC93b3JrZXJzL25ldHdvcmtXb3JrZXIuanMiLCJtYXBwaW5ncyI6IkFBQUEsd0NBQXdDLEdBRXhDLHVCQUF1QjtBQUV2QiwwQkFBMEI7QUFDMUIsZUFBZTtBQUNmLHdCQUF3QjtBQUN4QixzQkFBc0I7QUFDdEIsMkJBQTJCO0FBQzNCLHNCQUFzQjtBQUN0QixpQkFBaUI7QUFDakIsb0RBQW9EO0FBQ3BELDJDQUEyQztBQUMzQyxJQUFJO0FBRUosZ0NBQWdDO0FBQ2hDLG1DQUFtQztBQUNuQyxpQ0FBaUM7QUFDakMsZ0NBQWdDO0FBQ2hDLHVCQUF1QjtBQUN2QixnQ0FBZ0M7QUFDaEMsK0NBQStDO0FBQy9DLCtCQUErQjtBQUMvQixvQ0FBb0M7QUFDcEMseUNBQXlDO0FBQ3pDLCtCQUErQjtBQUMvQiw4Q0FBOEM7QUFDOUMsSUFBSTtBQUVKLFNBQVNBLGVBQWVDLFFBQVEsRUFBRUMsT0FBTyxFQUFFQyxjQUFjLEVBQUVDLFFBQVE7SUFDakUsSUFBTUMsUUFBUUosU0FBU0ssTUFBTTtJQUM3QixJQUFJQyxXQUFXLEVBQUU7SUFDakJDLEtBQUtDLFdBQVcsQ0FBQztRQUFFQyxNQUFNO1FBQVlDLFNBQVM7SUFBRTtJQUVoRFYsU0FBU1csT0FBTyxDQUFDLFNBQUNDLFNBQVNDO1FBQ3pCLFFBQVE7UUFDUixJQUFNQyxxQkFDSmIsUUFBUWMsV0FBVyxDQUFDQyxRQUFRLENBQUMsVUFDN0JmLFFBQVFjLFdBQVcsQ0FBQ0MsUUFBUSxDQUFDSixRQUFRRyxXQUFXLEtBQ2hEZCxRQUFRYyxXQUFXLEtBQUssU0FDeEJILFFBQVFHLFdBQVcsS0FBS2QsUUFBUWMsV0FBVztRQUU3QyxRQUFRO1FBQ1IsSUFBTUUsbUJBQ0poQixRQUFRaUIsU0FBUyxDQUFDRixRQUFRLENBQUMsVUFDM0JmLFFBQVFpQixTQUFTLENBQUNGLFFBQVEsQ0FBQ0osUUFBUU0sU0FBUyxLQUM1Q2pCLFFBQVFpQixTQUFTLEtBQUssU0FDdEJOLFFBQVFNLFNBQVMs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Iiwic291cmNlcyI6WyJDOlxcVXNlcnNcXDQxbVxcRGVza3RvcFxcTUlHTkVUVlVfVUlcXGFwcFxcd29ya2Vyc1xcbmV0d29ya1dvcmtlci5qcyJdLCJzb3VyY2VzQ29udGVudCI6WyIvKiBlc2xpbnQtZGlzYWJsZSBuby1yZXN0cmljdGVkLWdsb2JhbHMgKi9cclxuXHJcbi8vIOuEpO2KuOybjO2BrCDtlYTthLDrp4Eg67CPIOykkeyLrOyEsSDqs4TsgrAg7JuM7LukXHJcblxyXG4vLyBleHBvcnQgdHlwZSBOZXR3b3JrID0ge1xyXG4vLyAgIGlkOiBudW1iZXJcclxuLy8gICBuYXRpb25hbGl0eTogc3RyaW5nXHJcbi8vICAgZXRobmljaXR5OiBzdHJpbmdcclxuLy8gICBtaWdyYXRpb25feWVhcjogbnVtYmVyXHJcbi8vICAgdXNlcl9uYW1lOiBzdHJpbmdcclxuLy8gICB0eXBlOiBzdHJpbmdcclxuLy8gICBlZGdlczogeyBlZGdlVHlwZTogc3RyaW5nOyB0YXJnZXRJZDogbnVtYmVyIH1bXVxyXG4vLyAgIG1pZ3JhdGlvbl90cmFjZXM6IHsgcmVhc29uOiBzdHJpbmcgfVtdXHJcbi8vIH1cclxuXHJcbi8vIGV4cG9ydCB0eXBlIEZpbHRlck9wdGlvbnMgPSB7XHJcbi8vICAgbmF0aW9uYWxpdHk6IHN0cmluZ1tdIHwgc3RyaW5nXHJcbi8vICAgZXRobmljaXR5OiBzdHJpbmdbXSB8IHN0cmluZ1xyXG4vLyAgIGVkZ2VUeXBlOiBzdHJpbmdbXSB8IHN0cmluZ1xyXG4vLyAgIGVudGl0eVR5cGU6IHN0cmluZ1xyXG4vLyAgIHllYXJSYW5nZTogW251bWJlciwgbnVtYmVyXVxyXG4vLyAgIG1pZ3JhdGlvblllYXJSYW5nZTogW251bWJlciwgbnVtYmVyXSAvLyDstpTqsIBcclxuLy8gICB1c2VyTmV0d29ya0ZpbHRlcjogYm9vbGVhblxyXG4vLyAgIHVzZXJOZXR3b3JrVHJhY2VGaWx0ZXI6IGJvb2xlYW5cclxuLy8gICB1c2VyTmV0d29ya0Nvbm5lY3Rpb25GaWx0ZXI6IGJvb2xlYW5cclxuLy8gICBtaWdyYXRpb25SZWFzb25zOiBzdHJpbmdbXVxyXG4vLyAgIHNlbGVjdGVkTWlncmF0aW9uTmV0d29ya0lkOiBudW1iZXIgfCBudWxsXHJcbi8vIH1cclxuXHJcbmZ1bmN0aW9uIGZpbHRlck5ldHdvcmtzKG5ldHdvcmtzLCBmaWx0ZXJzLCBzZWxlY3RlZEVkZ2VJZCwgdXNlck5hbWUpIHtcclxuICBjb25zdCB0b3RhbCA9IG5ldHdvcmtzLmxlbmd0aFxyXG4gIGxldCBmaWx0ZXJlZCA9IFtdXHJcbiAgc2VsZi5wb3N0TWVzc2FnZSh7IHR5cGU6IFwiUFJPR1JFU1NcIiwgcGF5bG9hZDogMCB9KVxyXG5cclxuICBuZXR3b3Jrcy5mb3JFYWNoKChuZXR3b3JrLCBpZHgpID0+IHtcclxuICAgIC8vIOq1reyggSDtlYTthLBcclxuICAgIGNvbnN0IG1hdGNoZXNOYXRpb25hbGl0eSA9XHJcbiAgICAgIGZpbHRlcnMubmF0aW9uYWxpdHkuaW5jbHVkZXMoXCJhbGxcIikgfHxcclxuICAgICAgZmlsdGVycy5uYXRpb25hbGl0eS5pbmNsdWRlcyhuZXR3b3JrLm5hdGlvbmFsaXR5KSB8fFxyXG4gICAgICBmaWx0ZXJzLm5hdGlvbmFsaXR5ID09PSBcImFsbFwiIHx8XHJcbiAgICAgIG5ldHdvcmsubmF0aW9uYWxpdHkgPT09IGZpbHRlcnMubmF0aW9uYWxpdHlcclxuXHJcbiAgICAvLyDrr7zsobEg7ZWE7YSwXHJcbiAgICBjb25zdCBtYXRjaGVzRXRobmljaXR5ID1cclxuICAgICAgZmlsdGVycy5ldGhuaWNpdHkuaW5jbHVkZXMoXCJhbGxcIikgfHxcclxuICAgICAgZmlsdGVycy5ldGhuaWNpdHkuaW5jbHVkZXMobmV0d29yay5ldGhuaWNpdHkpIHx8XHJcbiAgICAgIGZpbHRlcnMuZXRobmljaXR5ID09PSBcImFsbFwiIHx8XHJcbiAgICAgIG5ldHdvcmsuZXRobmljaXR5ID09PSBmaWx0ZXJzLmV0aG5pY2l0eVxyXG5cclxuICAgIC8vIOyXsOuPhCDtlYTthLBcclxuICAgIGNvbnN0IG1hdGNoZXNZZWFyUmFuZ2UgPVxyXG4gICAgICBuZXR3b3JrLm1pZ3JhdGlvbl95ZWFyID49IGZpbHRlcnMueWVhclJhbmdlWzBdICYmXHJcbiAgICAgIG5ldHdvcmsubWlncmF0aW9uX3llYXIgPD0gZmlsdGVycy55ZWFyUmFuZ2VbMV1cclxuXHJcbiAgICAvLyDsnbTrj5nsl7Drj4Qo7J207KO87Jew64+EKSDtlYTthLA6IG1pZ3JhdGlvbl90cmFjZXMg7KSRIO2VmOuCmOudvOuPhCBtaWdyYXRpb25ZZWFyUmFuZ2Xsl5Ag7Y+s7ZWo65CY66m0IO2GteqzvFxyXG4gICAgY29uc3QgbWF0Y2hlc01pZ3JhdGlvblllYXJSYW5nZSA9XHJcbiAgICAgICFmaWx0ZXJzLm1pZ3JhdGlvblllYXJSYW5nZSB8fFxyXG4gICAgICBmaWx0ZXJzLm1pZ3JhdGlvblllYXJSYW5nZS5sZW5ndGggIT09IDIgfHxcclxuICAgICAgbmV0d29yay5taWdyYXRpb25fdHJhY2VzLnNvbWUoXHJcbiAgICAgICAgKHRyYWNlKSA9PlxyXG4gICAgICAgICAgdHJhY2UubWlncmF0aW9uX3llYXIgPj0gZmlsdGVycy5taWdyYXRpb25ZZWFyUmFuZ2VbMF0gJiZcclxuICAgICAgICAgIHRyYWNlLm1pZ3JhdGlvbl95ZWFyIDw9IGZpbHRlcnMubWlncmF0aW9uWWVhclJhbmdlWzFdLFxyXG4gICAgICApXHJcblxyXG4gICAgLy8g7Jyg7KCAIOuEpO2KuOybjO2BrCDtlYTthLBcclxuICAgIGNvbnN0IG1hdGNoZXNVc2VyTmV0d29yayA9XHJcbiAgICAgICFmaWx0ZXJzLnVzZXJOZXR3b3JrRmlsdGVyIHx8ICF1c2VyTmFtZSB8fCBuZXR3b3JrLnVzZXJfbmFtZSA9PT0gdXNlck5hbWVcclxuXHJcbiAgICAvLyDsl6Psp4Ag7ZWE7YSwXHJcbiAgICBjb25zdCBtYXRjaGVzRWRnZSA9XHJcbiAgICAgICFzZWxlY3RlZEVkZ2VJZCB8fFxyXG4gICAgICBuZXR3b3JrLmVkZ2VzLnNvbWUoKGVkZ2UpID0+IGVkZ2UudGFyZ2V0SWQgPT09IHNlbGVjdGVkRWRnZUlkKVxyXG5cclxuICAgIC8vIOyXlO2LsO2LsCDtg4DsnoUg7ZWE7YSwXHJcbiAgICBjb25zdCBtYXRjaGVzRW50aXR5VHlwZSA9XHJcbiAgICAgIGZpbHRlcnMuZW50aXR5VHlwZSA9PT0gXCJhbGxcIiB8fFxyXG4gICAgICAoQXJyYXkuaXNBcnJheShmaWx0ZXJzLmVudGl0eVR5cGUpXHJcbiAgICAgICAgPyBmaWx0ZXJzLmVudGl0eVR5cGUuaW5jbHVkZXMoXCJhbGxcIikgfHxcclxuICAgICAgICAgIGZpbHRlcnMuZW50aXR5VHlwZS5pbmNsdWRlcyhuZXR3b3JrLnR5cGUpXHJcbiAgICAgICAgOiBuZXR3b3JrLnR5cGUgPT09IGZpbHRlcnMuZW50aXR5VHlwZSlcclxuXHJcbiAgICAvLyDsl6Psp4Ag7YOA7J6FIO2VhO2EsCAo66mA7YuwIOyngOybkClcclxuICAgIGxldCBtYXRjaGVzRWRnZVR5cGUgPSB0cnVlXHJcbiAgICBpZiAoXHJcbiAgICAgIGZpbHRlcnMuZWRnZVR5cGUgJiZcclxuICAgICAgZmlsdGVycy5lZGdlVHlwZS5sZW5ndGggPiAwICYmXHJcbiAgICAgICFmaWx0ZXJzLmVkZ2VUeXBlLmluY2x1ZGVzKFwiYWxsXCIpXHJcbiAgICApIHtcclxuICAgICAgbWF0Y2hlc0VkZ2VUeXBlID0gbmV0d29yay5lZGdlcy5zb21lKChlZGdlKSA9PlxyXG4gICAgICAgIEFycmF5LmlzQXJyYXkoZmlsdGVycy5lZGdlVHlwZSlcclxuICAgICAgICAgID8gZmlsdGVycy5lZGdlVHlwZS5pbmNsdWRlcyhlZGdlLmVkZ2VUeXBlKVxyXG4gICAgICAgICAgOiBmaWx0ZXJzLmVkZ2VUeXBlID09PSBlZGdlLmVkZ2VUeXBlLFxyXG4gICAgICApXHJcbiAgICB9XHJcblxyXG4gICAgLy8g7J207KO8IOybkOyduCDtlYTthLBcclxuICAgIGNvbnN0IG1hdGNoZXNNaWdyYXRpb25SZWFzb25zID1cclxuICAgICAgZmlsdGVycy5taWdyYXRpb25SZWFzb25zLmluY2x1ZGVzKFwiYWxsXCIpIHx8XHJcbiAgICAgIGZpbHRlcnMubWlncmF0aW9uUmVhc29ucy5sZW5ndGggPT09IDAgfHxcclxuICAgICAgbmV0d29yay5taWdyYXRpb25fdHJhY2VzLnNvbWUoKHRyYWNlKSA9PlxyXG4gICAgICAgIGZpbHRlcnMubWlncmF0aW9uUmVhc29ucy5pbmNsdWRlcyh0cmFjZS5yZWFzb24pLFxyXG4gICAgICApXHJcblxyXG4gICAgLy8g7Jes65+sIOuEpO2KuOybjO2BrCDtlYTthLBcclxuICAgIGNvbnN0IG1hdGNoZXNTZWxlY3RlZE1pZ3JhdGlvbk5ldHdvcmtzID1cclxuICAgICAgIWZpbHRlcnMuc2VsZWN0ZWRNaWdyYXRpb25OZXR3b3JrSWRzIHx8XHJcbiAgICAgIGZpbHRlcnMuc2VsZWN0ZWRNaWdyYXRpb25OZXR3b3JrSWRzLmxlbmd0aCA9PT0gMCB8fFxyXG4gICAgICBmaWx0ZXJzLnNlbGVjdGVkTWlncmF0aW9uTmV0d29ya0lkcy5pbmNsdWRlcyhuZXR3b3JrLmlkKVxyXG5cclxuICAgIGNvbnN0IG1hdGNoZXMgPVxyXG4gICAgICBtYXRjaGVzTmF0aW9uYWxpdHkgJiZcclxuICAgICAgbWF0Y2hlc0V0aG5pY2l0eSAmJlxyXG4gICAgICBtYXRjaGVzWWVhclJhbmdlICYmXHJcbiAgICAgIG1hdGNoZXNNaWdyYXRpb25ZZWFyUmFuZ2UgJiZcclxuICAgICAgbWF0Y2hlc1VzZXJOZXR3b3JrICYmXHJcbiAgICAgIG1hdGNoZXNFZGdlICYmXHJcbiAgICAgIG1hdGNoZXNFbnRpdHlUeXBlICYmXHJcbiAgICAgIG1hdGNoZXNNaWdyYXRpb25SZWFzb25zICYmXHJcbiAgICAgIG1hdGNoZXNTZWxlY3RlZE1pZ3JhdGlvbk5ldHdvcmtzICYmXHJcbiAgICAgIG1hdGNoZXNFZGdlVHlwZSAvLyDstpTqsIBcclxuXHJcbiAgICBpZiAobWF0Y2hlcykgZmlsdGVyZWQucHVzaChuZXR3b3JrKVxyXG5cclxuICAgIC8vIDUlIOuLqOychOuhnCDsp4TtlonrpaAg66mU7Iuc7KeAIOyghOyGoSAo7Zi57J2AIDEwMOqwnOuniOuLpCDrk7EpXHJcbiAgICBpZiAoaWR4ICUgTWF0aC5jZWlsKHRvdGFsIC8gMjApID09PSAwIHx8IGlkeCA9PT0gdG90YWwgLSAxKSB7XHJcbiAgICAgIGNvbnN0IHBlcmNlbnQgPSBNYXRoLnJvdW5kKCgoaWR4ICsgMSkgLyB0b3RhbCkgKiAxMDApXHJcblxyXG4gICAgICBzZWxmLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJQUk9HUkVTU1wiLCBwYXlsb2FkOiBwZXJjZW50IH0pXHJcbiAgICB9XHJcbiAgfSlcclxuXHJcbiAgcmV0dXJuIGZpbHRlcmVkXHJcbn1cclxuXHJcbi8vIOykkeyLrOyEsSDqs4TsgrAgKOyYiOyLnDogZGVncmVlIGNlbnRyYWxpdHkpXHJcbmZ1bmN0aW9uIGNhbGN1bGF0ZUNlbnRyYWxpdHkoZmlsdGVyZWROZXR3b3JrcywgY2VudHJhbGl0eVR5cGUpIHtcclxuICBjb25zdCBjZW50cmFsaXR5ID0ge31cclxuICBpZiAoY2VudHJhbGl0eVR5cGUgPT09IFwiZGVncmVlXCIpIHtcclxuICAgIGZpbHRlcmVkTmV0d29ya3MuZm9yRWFjaCgobmV0d29yaykgPT4ge1xyXG4gICAgICBjZW50cmFsaXR5W25ldHdvcmsuaWRdID0gbmV0d29yay5lZGdlcy5sZW5ndGhcclxuICAgIH0pXHJcbiAgfSBlbHNlIGlmIChjZW50cmFsaXR5VHlwZSA9PT0gXCJub25lXCIpIHtcclxuICAgIGZpbHRlcmVkTmV0d29ya3MuZm9yRWFjaCgobmV0d29yaykgPT4ge1xyXG4gICAgICBjZW50cmFsaXR5W25ldHdvcmsuaWRdID0gMVxyXG4gICAgfSlcclxuICB9XHJcbiAgLy8g7ZWE7JqU7IucIOuLpOuluCDspJHsi6zshLHrj4Qg7LaU6rCAXHJcbiAgcmV0dXJuIGNlbnRyYWxpdHlcclxufVxyXG5cclxuc2VsZi5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZSkge1xyXG4gIGNvbnN0IHsgdHlwZSwgcGF5bG9hZCB9ID0gZS5kYXRhXHJcblxyXG4gIGlmICh0eXBlID09PSBcIkZJTFRFUl9ORVRXT1JLU1wiKSB7XHJcbiAgICBzZWxmLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJQUk9HUkVTU1wiLCBwYXlsb2FkOiAwIH0pIC8vIOuwmOuTnOyLnCAw67aA7YSwIOyLnOyekSFcclxuICAgIGNvbnN0IGZpbHRlcmVkID0gZmlsdGVyTmV0d29ya3MoXHJcbiAgICAgIHBheWxvYWQubmV0d29ya3MsXHJcbiAgICAgIHBheWxvYWQuZmlsdGVycyxcclxuICAgICAgcGF5bG9hZC5zZWxlY3RlZEVkZ2VJZCxcclxuICAgICAgcGF5bG9hZC51c2VyTmFtZSxcclxuICAgIClcclxuICAgIHNlbGYucG9zdE1lc3NhZ2UoeyB0eXBlOiBcIkZJTFRFUkVEX05FVFdPUktTXCIsIHBheWxvYWQ6IGZpbHRlcmVkIH0pXHJcbiAgICBzZWxmLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJQUk9HUkVTU1wiLCBwYXlsb2FkOiAxMDAgfSkgLy8g66eI7KeA66eJ7JeQIDEwMCFcclxuICB9XHJcblxyXG4gIGlmICh0eXBlID09PSBcIkNBTENVTEFURV9DRU5UUkFMSVRZXCIpIHtcclxuICAgIGNvbnN0IHsgZmlsdGVyZWROZXR3b3JrcywgY2VudHJhbGl0eVR5cGUgfSA9IHBheWxvYWRcclxuICAgIGNvbnN0IHJlc3VsdCA9IGNhbGN1bGF0ZUNlbnRyYWxpdHkoZmlsdGVyZWROZXR3b3JrcywgY2VudHJhbGl0eVR5cGUpXHJcbiAgICBzZWxmLnBvc3RNZXNzYWdlKHsgdHlwZTogXCJDRU5UUkFMSVRZX1JFU1VMVFwiLCBwYXlsb2FkOiByZXN1bHQgfSlcclxuICB9XHJcbn1cclxuIl0sIm5hbWVzIjpbImZpbHRlck5ldHdvcmtzIiwibmV0d29ya3MiLCJmaWx0ZXJzIiwic2VsZWN0ZWRFZGdlSWQiLCJ1c2VyTmFtZSIsInRvdGFsIiwibGVuZ3RoIiwiZmlsdGVyZWQiLCJzZWxmIiwicG9zdE1lc3NhZ2UiLCJ0eXBlIiwicGF5bG9hZCIsImZvckVhY2giLCJuZXR3b3JrIiwiaWR4IiwibWF0Y2hlc05hdGlvbmFsaXR5IiwibmF0aW9uYWxpdHkiLCJpbmNsdWRlcyIsIm1hdGNoZXNFdGhuaWNpdHkiLCJldGhuaWNpdHkiLCJtYXRjaGVzWWVhclJhbmdlIiwibWlncmF0aW9uX3llYXIiLCJ5ZWFyUmFuZ2UiLCJtYXRjaGVzTWlncmF0aW9uWWVhclJhbmdlIiwibWlncmF0aW9uWWVhclJhbmdlIiwibWlncmF0aW9uX3RyYWNlcyIsInNvbWUiLCJ0cmFjZSIsIm1hdGNoZXNVc2VyTmV0d29yayIsInVzZXJOZXR3b3JrRmlsdGVyIiwidXNlcl9uYW1lIiwibWF0Y2hlc0VkZ2UiLCJlZGdlcyIsImVkZ2UiLCJ0YXJnZXRJZCIsIm1hdGNoZXNFbnRpdHlUeXBlIiwiZW50aXR5VHlwZSIsIkFycmF5IiwiaXNBcnJheSIsIm1hdGNoZXNFZGdlVHlwZSIsImVkZ2VUeXBlIiwibWF0Y2hlc01pZ3JhdGlvblJlYXNvbnMiLCJtaWdyYXRpb25SZWFzb25zIiwicmVhc29uIiwibWF0Y2hlc1NlbGVjdGVkTWlncmF0aW9uTmV0d29ya3MiLCJzZWxlY3RlZE1pZ3JhdGlvbk5ldHdvcmtJZHMiLCJpZCIsIm1hdGNoZXMiLCJwdXNoIiwiTWF0aCIsImNlaWwiLCJwZXJjZW50Iiwicm91bmQiLCJjYWxjdWxhdGVDZW50cmFsaXR5IiwiZmlsdGVyZWROZXR3b3JrcyIsImNlbnRyYWxpdHlUeXBlIiwiY2VudHJhbGl0eSIsIm9ubWVzc2FnZSIsImUiLCJkYXRhIiwicmVzdWx0Il0sImlnbm9yZUxpc3QiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(app-pages-browser)/./app/workers/networkWorker.js\n"));

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			if (cachedModule.error !== undefined) throw cachedModule.error;
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		var threw = true;
/******/ 		try {
/******/ 			var execOptions = { id: moduleId, module: module, factory: __webpack_modules__[moduleId], require: __webpack_require__ };
/******/ 			__webpack_require__.i.forEach(function(handler) { handler(execOptions); });
/******/ 			module = execOptions.module;
/******/ 			execOptions.factory.call(module.exports, module, module.exports, execOptions.require);
/******/ 			threw = false;
/******/ 		} finally {
/******/ 			if(threw) delete __webpack_module_cache__[moduleId];
/******/ 		}
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = __webpack_module_cache__;
/******/ 	
/******/ 	// expose the module execution interceptor
/******/ 	__webpack_require__.i = [];
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/get javascript update chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference all chunks
/******/ 		__webpack_require__.hu = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "static/webpack/" + chunkId + "." + __webpack_require__.h() + ".hot-update.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get mini-css chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks
/******/ 		__webpack_require__.miniCssF = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return undefined;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get update manifest filename */
/******/ 	(() => {
/******/ 		__webpack_require__.hmrF = () => ("static/webpack/" + __webpack_require__.h() + ".dcfff317b504e8a2.hot-update.json");
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/getFullHash */
/******/ 	(() => {
/******/ 		__webpack_require__.h = () => ("6be7dfd1cb2b8c32")
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types policy */
/******/ 	(() => {
/******/ 		var policy;
/******/ 		__webpack_require__.tt = () => {
/******/ 			// Create Trusted Type policy if Trusted Types are available and the policy doesn't exist yet.
/******/ 			if (policy === undefined) {
/******/ 				policy = {
/******/ 					createScript: (script) => (script),
/******/ 					createScriptURL: (url) => (url)
/******/ 				};
/******/ 				if (typeof trustedTypes !== "undefined" && trustedTypes.createPolicy) {
/******/ 					policy = trustedTypes.createPolicy("nextjs#bundler", policy);
/******/ 				}
/******/ 			}
/******/ 			return policy;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types script */
/******/ 	(() => {
/******/ 		__webpack_require__.ts = (script) => (__webpack_require__.tt().createScript(script));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/trusted types script url */
/******/ 	(() => {
/******/ 		__webpack_require__.tu = (url) => (__webpack_require__.tt().createScriptURL(url));
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hot module replacement */
/******/ 	(() => {
/******/ 		var currentModuleData = {};
/******/ 		var installedModules = __webpack_require__.c;
/******/ 		
/******/ 		// module and require creation
/******/ 		var currentChildModule;
/******/ 		var currentParents = [];
/******/ 		
/******/ 		// status
/******/ 		var registeredStatusHandlers = [];
/******/ 		var currentStatus = "idle";
/******/ 		
/******/ 		// while downloading
/******/ 		var blockingPromises = 0;
/******/ 		var blockingPromisesWaiting = [];
/******/ 		
/******/ 		// The update info
/******/ 		var currentUpdateApplyHandlers;
/******/ 		var queuedInvalidatedModules;
/******/ 		
/******/ 		__webpack_require__.hmrD = currentModuleData;
/******/ 		
/******/ 		__webpack_require__.i.push(function (options) {
/******/ 			var module = options.module;
/******/ 			var require = createRequire(options.require, options.id);
/******/ 			module.hot = createModuleHotObject(options.id, module);
/******/ 			module.parents = currentParents;
/******/ 			module.children = [];
/******/ 			currentParents = [];
/******/ 			options.require = require;
/******/ 		});
/******/ 		
/******/ 		__webpack_require__.hmrC = {};
/******/ 		__webpack_require__.hmrI = {};
/******/ 		
/******/ 		function createRequire(require, moduleId) {
/******/ 			var me = installedModules[moduleId];
/******/ 			if (!me) return require;
/******/ 			var fn = function (request) {
/******/ 				if (me.hot.active) {
/******/ 					if (installedModules[request]) {
/******/ 						var parents = installedModules[request].parents;
/******/ 						if (parents.indexOf(moduleId) === -1) {
/******/ 							parents.push(moduleId);
/******/ 						}
/******/ 					} else {
/******/ 						currentParents = [moduleId];
/******/ 						currentChildModule = request;
/******/ 					}
/******/ 					if (me.children.indexOf(request) === -1) {
/******/ 						me.children.push(request);
/******/ 					}
/******/ 				} else {
/******/ 					console.warn(
/******/ 						"[HMR] unexpected require(" +
/******/ 							request +
/******/ 							") from disposed module " +
/******/ 							moduleId
/******/ 					);
/******/ 					currentParents = [];
/******/ 				}
/******/ 				return require(request);
/******/ 			};
/******/ 			var createPropertyDescriptor = function (name) {
/******/ 				return {
/******/ 					configurable: true,
/******/ 					enumerable: true,
/******/ 					get: function () {
/******/ 						return require[name];
/******/ 					},
/******/ 					set: function (value) {
/******/ 						require[name] = value;
/******/ 					}
/******/ 				};
/******/ 			};
/******/ 			for (var name in require) {
/******/ 				if (Object.prototype.hasOwnProperty.call(require, name) && name !== "e") {
/******/ 					Object.defineProperty(fn, name, createPropertyDescriptor(name));
/******/ 				}
/******/ 			}
/******/ 			fn.e = function (chunkId, fetchPriority) {
/******/ 				return trackBlockingPromise(require.e(chunkId, fetchPriority));
/******/ 			};
/******/ 			return fn;
/******/ 		}
/******/ 		
/******/ 		function createModuleHotObject(moduleId, me) {
/******/ 			var _main = currentChildModule !== moduleId;
/******/ 			var hot = {
/******/ 				// private stuff
/******/ 				_acceptedDependencies: {},
/******/ 				_acceptedErrorHandlers: {},
/******/ 				_declinedDependencies: {},
/******/ 				_selfAccepted: false,
/******/ 				_selfDeclined: false,
/******/ 				_selfInvalidated: false,
/******/ 				_disposeHandlers: [],
/******/ 				_main: _main,
/******/ 				_requireSelf: function () {
/******/ 					currentParents = me.parents.slice();
/******/ 					currentChildModule = _main ? undefined : moduleId;
/******/ 					__webpack_require__(moduleId);
/******/ 				},
/******/ 		
/******/ 				// Module API
/******/ 				active: true,
/******/ 				accept: function (dep, callback, errorHandler) {
/******/ 					if (dep === undefined) hot._selfAccepted = true;
/******/ 					else if (typeof dep === "function") hot._selfAccepted = dep;
/******/ 					else if (typeof dep === "object" && dep !== null) {
/******/ 						for (var i = 0; i < dep.length; i++) {
/******/ 							hot._acceptedDependencies[dep[i]] = callback || function () {};
/******/ 							hot._acceptedErrorHandlers[dep[i]] = errorHandler;
/******/ 						}
/******/ 					} else {
/******/ 						hot._acceptedDependencies[dep] = callback || function () {};
/******/ 						hot._acceptedErrorHandlers[dep] = errorHandler;
/******/ 					}
/******/ 				},
/******/ 				decline: function (dep) {
/******/ 					if (dep === undefined) hot._selfDeclined = true;
/******/ 					else if (typeof dep === "object" && dep !== null)
/******/ 						for (var i = 0; i < dep.length; i++)
/******/ 							hot._declinedDependencies[dep[i]] = true;
/******/ 					else hot._declinedDependencies[dep] = true;
/******/ 				},
/******/ 				dispose: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				addDisposeHandler: function (callback) {
/******/ 					hot._disposeHandlers.push(callback);
/******/ 				},
/******/ 				removeDisposeHandler: function (callback) {
/******/ 					var idx = hot._disposeHandlers.indexOf(callback);
/******/ 					if (idx >= 0) hot._disposeHandlers.splice(idx, 1);
/******/ 				},
/******/ 				invalidate: function () {
/******/ 					this._selfInvalidated = true;
/******/ 					switch (currentStatus) {
/******/ 						case "idle":
/******/ 							currentUpdateApplyHandlers = [];
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									currentUpdateApplyHandlers
/******/ 								);
/******/ 							});
/******/ 							setStatus("ready");
/******/ 							break;
/******/ 						case "ready":
/******/ 							Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 								__webpack_require__.hmrI[key](
/******/ 									moduleId,
/******/ 									currentUpdateApplyHandlers
/******/ 								);
/******/ 							});
/******/ 							break;
/******/ 						case "prepare":
/******/ 						case "check":
/******/ 						case "dispose":
/******/ 						case "apply":
/******/ 							(queuedInvalidatedModules = queuedInvalidatedModules || []).push(
/******/ 								moduleId
/******/ 							);
/******/ 							break;
/******/ 						default:
/******/ 							// ignore requests in error states
/******/ 							break;
/******/ 					}
/******/ 				},
/******/ 		
/******/ 				// Management API
/******/ 				check: hotCheck,
/******/ 				apply: hotApply,
/******/ 				status: function (l) {
/******/ 					if (!l) return currentStatus;
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				addStatusHandler: function (l) {
/******/ 					registeredStatusHandlers.push(l);
/******/ 				},
/******/ 				removeStatusHandler: function (l) {
/******/ 					var idx = registeredStatusHandlers.indexOf(l);
/******/ 					if (idx >= 0) registeredStatusHandlers.splice(idx, 1);
/******/ 				},
/******/ 		
/******/ 				// inherit from previous dispose call
/******/ 				data: currentModuleData[moduleId]
/******/ 			};
/******/ 			currentChildModule = undefined;
/******/ 			return hot;
/******/ 		}
/******/ 		
/******/ 		function setStatus(newStatus) {
/******/ 			currentStatus = newStatus;
/******/ 			var results = [];
/******/ 		
/******/ 			for (var i = 0; i < registeredStatusHandlers.length; i++)
/******/ 				results[i] = registeredStatusHandlers[i].call(null, newStatus);
/******/ 		
/******/ 			return Promise.all(results).then(function () {});
/******/ 		}
/******/ 		
/******/ 		function unblock() {
/******/ 			if (--blockingPromises === 0) {
/******/ 				setStatus("ready").then(function () {
/******/ 					if (blockingPromises === 0) {
/******/ 						var list = blockingPromisesWaiting;
/******/ 						blockingPromisesWaiting = [];
/******/ 						for (var i = 0; i < list.length; i++) {
/******/ 							list[i]();
/******/ 						}
/******/ 					}
/******/ 				});
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function trackBlockingPromise(promise) {
/******/ 			switch (currentStatus) {
/******/ 				case "ready":
/******/ 					setStatus("prepare");
/******/ 				/* fallthrough */
/******/ 				case "prepare":
/******/ 					blockingPromises++;
/******/ 					promise.then(unblock, unblock);
/******/ 					return promise;
/******/ 				default:
/******/ 					return promise;
/******/ 			}
/******/ 		}
/******/ 		
/******/ 		function waitForBlockingPromises(fn) {
/******/ 			if (blockingPromises === 0) return fn();
/******/ 			return new Promise(function (resolve) {
/******/ 				blockingPromisesWaiting.push(function () {
/******/ 					resolve(fn());
/******/ 				});
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		function hotCheck(applyOnUpdate) {
/******/ 			if (currentStatus !== "idle") {
/******/ 				throw new Error("check() is only allowed in idle status");
/******/ 			}
/******/ 			return setStatus("check")
/******/ 				.then(__webpack_require__.hmrM)
/******/ 				.then(function (update) {
/******/ 					if (!update) {
/******/ 						return setStatus(applyInvalidatedModules() ? "ready" : "idle").then(
/******/ 							function () {
/******/ 								return null;
/******/ 							}
/******/ 						);
/******/ 					}
/******/ 		
/******/ 					return setStatus("prepare").then(function () {
/******/ 						var updatedModules = [];
/******/ 						currentUpdateApplyHandlers = [];
/******/ 		
/******/ 						return Promise.all(
/******/ 							Object.keys(__webpack_require__.hmrC).reduce(function (
/******/ 								promises,
/******/ 								key
/******/ 							) {
/******/ 								__webpack_require__.hmrC[key](
/******/ 									update.c,
/******/ 									update.r,
/******/ 									update.m,
/******/ 									promises,
/******/ 									currentUpdateApplyHandlers,
/******/ 									updatedModules
/******/ 								);
/******/ 								return promises;
/******/ 							}, [])
/******/ 						).then(function () {
/******/ 							return waitForBlockingPromises(function () {
/******/ 								if (applyOnUpdate) {
/******/ 									return internalApply(applyOnUpdate);
/******/ 								}
/******/ 								return setStatus("ready").then(function () {
/******/ 									return updatedModules;
/******/ 								});
/******/ 							});
/******/ 						});
/******/ 					});
/******/ 				});
/******/ 		}
/******/ 		
/******/ 		function hotApply(options) {
/******/ 			if (currentStatus !== "ready") {
/******/ 				return Promise.resolve().then(function () {
/******/ 					throw new Error(
/******/ 						"apply() is only allowed in ready status (state: " +
/******/ 							currentStatus +
/******/ 							")"
/******/ 					);
/******/ 				});
/******/ 			}
/******/ 			return internalApply(options);
/******/ 		}
/******/ 		
/******/ 		function internalApply(options) {
/******/ 			options = options || {};
/******/ 		
/******/ 			applyInvalidatedModules();
/******/ 		
/******/ 			var results = currentUpdateApplyHandlers.map(function (handler) {
/******/ 				return handler(options);
/******/ 			});
/******/ 			currentUpdateApplyHandlers = undefined;
/******/ 		
/******/ 			var errors = results
/******/ 				.map(function (r) {
/******/ 					return r.error;
/******/ 				})
/******/ 				.filter(Boolean);
/******/ 		
/******/ 			if (errors.length > 0) {
/******/ 				return setStatus("abort").then(function () {
/******/ 					throw errors[0];
/******/ 				});
/******/ 			}
/******/ 		
/******/ 			// Now in "dispose" phase
/******/ 			var disposePromise = setStatus("dispose");
/******/ 		
/******/ 			results.forEach(function (result) {
/******/ 				if (result.dispose) result.dispose();
/******/ 			});
/******/ 		
/******/ 			// Now in "apply" phase
/******/ 			var applyPromise = setStatus("apply");
/******/ 		
/******/ 			var error;
/******/ 			var reportError = function (err) {
/******/ 				if (!error) error = err;
/******/ 			};
/******/ 		
/******/ 			var outdatedModules = [];
/******/ 			results.forEach(function (result) {
/******/ 				if (result.apply) {
/******/ 					var modules = result.apply(reportError);
/******/ 					if (modules) {
/******/ 						for (var i = 0; i < modules.length; i++) {
/******/ 							outdatedModules.push(modules[i]);
/******/ 						}
/******/ 					}
/******/ 				}
/******/ 			});
/******/ 		
/******/ 			return Promise.all([disposePromise, applyPromise]).then(function () {
/******/ 				// handle errors in accept handlers and self accepted module load
/******/ 				if (error) {
/******/ 					return setStatus("fail").then(function () {
/******/ 						throw error;
/******/ 					});
/******/ 				}
/******/ 		
/******/ 				if (queuedInvalidatedModules) {
/******/ 					return internalApply(options).then(function (list) {
/******/ 						outdatedModules.forEach(function (moduleId) {
/******/ 							if (list.indexOf(moduleId) < 0) list.push(moduleId);
/******/ 						});
/******/ 						return list;
/******/ 					});
/******/ 				}
/******/ 		
/******/ 				return setStatus("idle").then(function () {
/******/ 					return outdatedModules;
/******/ 				});
/******/ 			});
/******/ 		}
/******/ 		
/******/ 		function applyInvalidatedModules() {
/******/ 			if (queuedInvalidatedModules) {
/******/ 				if (!currentUpdateApplyHandlers) currentUpdateApplyHandlers = [];
/******/ 				Object.keys(__webpack_require__.hmrI).forEach(function (key) {
/******/ 					queuedInvalidatedModules.forEach(function (moduleId) {
/******/ 						__webpack_require__.hmrI[key](
/******/ 							moduleId,
/******/ 							currentUpdateApplyHandlers
/******/ 						);
/******/ 					});
/******/ 				});
/******/ 				queuedInvalidatedModules = undefined;
/******/ 				return true;
/******/ 			}
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		__webpack_require__.p = "/_next/";
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/react refresh */
/******/ 	(() => {
/******/ 		if (__webpack_require__.i) {
/******/ 		__webpack_require__.i.push((options) => {
/******/ 			const originalFactory = options.factory;
/******/ 			options.factory = (moduleObject, moduleExports, webpackRequire) => {
/******/ 				const hasRefresh = typeof self !== "undefined" && !!self.$RefreshInterceptModuleExecution$;
/******/ 				const cleanup = hasRefresh ? self.$RefreshInterceptModuleExecution$(moduleObject.id) : () => {};
/******/ 				try {
/******/ 					originalFactory.call(this, moduleObject, moduleExports, webpackRequire);
/******/ 				} finally {
/******/ 					cleanup();
/******/ 				}
/******/ 			}
/******/ 		})
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat */
/******/ 	
/******/ 	
/******/ 	// noop fns to prevent runtime errors during initialization
/******/ 	if (typeof self !== "undefined") {
/******/ 		self.$RefreshReg$ = function () {};
/******/ 		self.$RefreshSig$ = function () {
/******/ 			return function (type) {
/******/ 				return type;
/******/ 			};
/******/ 		};
/******/ 	}
/******/ 	
/******/ 	/* webpack/runtime/css loading */
/******/ 	(() => {
/******/ 		var createStylesheet = (chunkId, fullhref, resolve, reject) => {
/******/ 			var linkTag = document.createElement("link");
/******/ 		
/******/ 			linkTag.rel = "stylesheet";
/******/ 			linkTag.type = "text/css";
/******/ 			var onLinkComplete = (event) => {
/******/ 				// avoid mem leaks.
/******/ 				linkTag.onerror = linkTag.onload = null;
/******/ 				if (event.type === 'load') {
/******/ 					resolve();
/******/ 				} else {
/******/ 					var errorType = event && (event.type === 'load' ? 'missing' : event.type);
/******/ 					var realHref = event && event.target && event.target.href || fullhref;
/******/ 					var err = new Error("Loading CSS chunk " + chunkId + " failed.\n(" + realHref + ")");
/******/ 					err.code = "CSS_CHUNK_LOAD_FAILED";
/******/ 					err.type = errorType;
/******/ 					err.request = realHref;
/******/ 					linkTag.parentNode.removeChild(linkTag)
/******/ 					reject(err);
/******/ 				}
/******/ 			}
/******/ 			linkTag.onerror = linkTag.onload = onLinkComplete;
/******/ 			linkTag.href = fullhref;
/******/ 		
/******/ 			(function(linkTag) {
/******/ 			                if (typeof _N_E_STYLE_LOAD === 'function') {
/******/ 			                    const { href, onload, onerror } = linkTag;
/******/ 			                    _N_E_STYLE_LOAD(href.indexOf(window.location.origin) === 0 ? new URL(href).pathname : href).then(()=>onload == null ? void 0 : onload.call(linkTag, {
/******/ 			                            type: 'load'
/******/ 			                        }), ()=>onerror == null ? void 0 : onerror.call(linkTag, {}));
/******/ 			                } else {
/******/ 			                    document.head.appendChild(linkTag);
/******/ 			                }
/******/ 			            })(linkTag)
/******/ 			return linkTag;
/******/ 		};
/******/ 		var findStylesheet = (href, fullhref) => {
/******/ 			var existingLinkTags = document.getElementsByTagName("link");
/******/ 			for(var i = 0; i < existingLinkTags.length; i++) {
/******/ 				var tag = existingLinkTags[i];
/******/ 				var dataHref = tag.getAttribute("data-href") || tag.getAttribute("href");
/******/ 				if(tag.rel === "stylesheet" && (dataHref === href || dataHref === fullhref)) return tag;
/******/ 			}
/******/ 			var existingStyleTags = document.getElementsByTagName("style");
/******/ 			for(var i = 0; i < existingStyleTags.length; i++) {
/******/ 				var tag = existingStyleTags[i];
/******/ 				var dataHref = tag.getAttribute("data-href");
/******/ 				if(dataHref === href || dataHref === fullhref) return tag;
/******/ 			}
/******/ 		};
/******/ 		var loadStylesheet = (chunkId) => {
/******/ 			return new Promise((resolve, reject) => {
/******/ 				var href = __webpack_require__.miniCssF(chunkId);
/******/ 				var fullhref = __webpack_require__.p + href;
/******/ 				if(findStylesheet(href, fullhref)) return resolve();
/******/ 				createStylesheet(chunkId, fullhref, resolve, reject);
/******/ 			});
/******/ 		}
/******/ 		// no chunk loading
/******/ 		
/******/ 		var oldTags = [];
/******/ 		var newTags = [];
/******/ 		var applyHandler = (options) => {
/******/ 			return { dispose: () => {
/******/ 				for(var i = 0; i < oldTags.length; i++) {
/******/ 					var oldTag = oldTags[i];
/******/ 					if(oldTag.parentNode) oldTag.parentNode.removeChild(oldTag);
/******/ 				}
/******/ 				oldTags.length = 0;
/******/ 			}, apply: () => {
/******/ 				for(var i = 0; i < newTags.length; i++) newTags[i].rel = "stylesheet";
/******/ 				newTags.length = 0;
/******/ 			} };
/******/ 		}
/******/ 		__webpack_require__.hmrC.miniCss = (chunkIds, removedChunks, removedModules, promises, applyHandlers, updatedModulesList) => {
/******/ 			applyHandlers.push(applyHandler);
/******/ 			chunkIds.forEach((chunkId) => {
/******/ 				var href = __webpack_require__.miniCssF(chunkId);
/******/ 				var fullhref = __webpack_require__.p + href;
/******/ 				var oldTag = findStylesheet(href, fullhref);
/******/ 				if(!oldTag) return;
/******/ 				promises.push(new Promise((resolve, reject) => {
/******/ 					var tag = createStylesheet(chunkId, fullhref, () => {
/******/ 						tag.as = "style";
/******/ 						tag.rel = "preload";
/******/ 						resolve();
/******/ 					}, reject);
/******/ 					oldTags.push(oldTag);
/******/ 					newTags.push(tag);
/******/ 				}));
/******/ 			});
/******/ 		}
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = __webpack_require__.hmrS_importScripts = __webpack_require__.hmrS_importScripts || {
/******/ 			"_app-pages-browser_app_workers_networkWorker_js": 1
/******/ 		};
/******/ 		
/******/ 		// no chunk install function needed
/******/ 		// no chunk loading
/******/ 		
/******/ 		function loadUpdateChunk(chunkId, updatedModulesList) {
/******/ 			var success = false;
/******/ 			self["webpackHotUpdate_N_E"] = (_, moreModules, runtime) => {
/******/ 				for(var moduleId in moreModules) {
/******/ 					if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 						currentUpdate[moduleId] = moreModules[moduleId];
/******/ 						if(updatedModulesList) updatedModulesList.push(moduleId);
/******/ 					}
/******/ 				}
/******/ 				if(runtime) currentUpdateRuntime.push(runtime);
/******/ 				success = true;
/******/ 			};
/******/ 			// start update chunk loading
/******/ 			importScripts(__webpack_require__.tu(__webpack_require__.p + __webpack_require__.hu(chunkId)));
/******/ 			if(!success) throw new Error("Loading update chunk failed for unknown reason");
/******/ 		}
/******/ 		
/******/ 		var currentUpdateChunks;
/******/ 		var currentUpdate;
/******/ 		var currentUpdateRemovedChunks;
/******/ 		var currentUpdateRuntime;
/******/ 		function applyHandler(options) {
/******/ 			if (__webpack_require__.f) delete __webpack_require__.f.importScriptsHmr;
/******/ 			currentUpdateChunks = undefined;
/******/ 			function getAffectedModuleEffects(updateModuleId) {
/******/ 				var outdatedModules = [updateModuleId];
/******/ 				var outdatedDependencies = {};
/******/ 		
/******/ 				var queue = outdatedModules.map(function (id) {
/******/ 					return {
/******/ 						chain: [id],
/******/ 						id: id
/******/ 					};
/******/ 				});
/******/ 				while (queue.length > 0) {
/******/ 					var queueItem = queue.pop();
/******/ 					var moduleId = queueItem.id;
/******/ 					var chain = queueItem.chain;
/******/ 					var module = __webpack_require__.c[moduleId];
/******/ 					if (
/******/ 						!module ||
/******/ 						(module.hot._selfAccepted && !module.hot._selfInvalidated)
/******/ 					)
/******/ 						continue;
/******/ 					if (module.hot._selfDeclined) {
/******/ 						return {
/******/ 							type: "self-declined",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					if (module.hot._main) {
/******/ 						return {
/******/ 							type: "unaccepted",
/******/ 							chain: chain,
/******/ 							moduleId: moduleId
/******/ 						};
/******/ 					}
/******/ 					for (var i = 0; i < module.parents.length; i++) {
/******/ 						var parentId = module.parents[i];
/******/ 						var parent = __webpack_require__.c[parentId];
/******/ 						if (!parent) continue;
/******/ 						if (parent.hot._declinedDependencies[moduleId]) {
/******/ 							return {
/******/ 								type: "declined",
/******/ 								chain: chain.concat([parentId]),
/******/ 								moduleId: moduleId,
/******/ 								parentId: parentId
/******/ 							};
/******/ 						}
/******/ 						if (outdatedModules.indexOf(parentId) !== -1) continue;
/******/ 						if (parent.hot._acceptedDependencies[moduleId]) {
/******/ 							if (!outdatedDependencies[parentId])
/******/ 								outdatedDependencies[parentId] = [];
/******/ 							addAllToSet(outdatedDependencies[parentId], [moduleId]);
/******/ 							continue;
/******/ 						}
/******/ 						delete outdatedDependencies[parentId];
/******/ 						outdatedModules.push(parentId);
/******/ 						queue.push({
/******/ 							chain: chain.concat([parentId]),
/******/ 							id: parentId
/******/ 						});
/******/ 					}
/******/ 				}
/******/ 		
/******/ 				return {
/******/ 					type: "accepted",
/******/ 					moduleId: updateModuleId,
/******/ 					outdatedModules: outdatedModules,
/******/ 					outdatedDependencies: outdatedDependencies
/******/ 				};
/******/ 			}
/******/ 		
/******/ 			function addAllToSet(a, b) {
/******/ 				for (var i = 0; i < b.length; i++) {
/******/ 					var item = b[i];
/******/ 					if (a.indexOf(item) === -1) a.push(item);
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			// at begin all updates modules are outdated
/******/ 			// the "outdated" status can propagate to parents if they don't accept the children
/******/ 			var outdatedDependencies = {};
/******/ 			var outdatedModules = [];
/******/ 			var appliedUpdate = {};
/******/ 		
/******/ 			var warnUnexpectedRequire = function warnUnexpectedRequire(module) {
/******/ 				console.warn(
/******/ 					"[HMR] unexpected require(" + module.id + ") to disposed module"
/******/ 				);
/******/ 			};
/******/ 		
/******/ 			for (var moduleId in currentUpdate) {
/******/ 				if (__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 					var newModuleFactory = currentUpdate[moduleId];
/******/ 					/** @type {TODO} */
/******/ 					var result = newModuleFactory
/******/ 						? getAffectedModuleEffects(moduleId)
/******/ 						: {
/******/ 								type: "disposed",
/******/ 								moduleId: moduleId
/******/ 							};
/******/ 					/** @type {Error|false} */
/******/ 					var abortError = false;
/******/ 					var doApply = false;
/******/ 					var doDispose = false;
/******/ 					var chainInfo = "";
/******/ 					if (result.chain) {
/******/ 						chainInfo = "\nUpdate propagation: " + result.chain.join(" -> ");
/******/ 					}
/******/ 					switch (result.type) {
/******/ 						case "self-declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of self decline: " +
/******/ 										result.moduleId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "declined":
/******/ 							if (options.onDeclined) options.onDeclined(result);
/******/ 							if (!options.ignoreDeclined)
/******/ 								abortError = new Error(
/******/ 									"Aborted because of declined dependency: " +
/******/ 										result.moduleId +
/******/ 										" in " +
/******/ 										result.parentId +
/******/ 										chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "unaccepted":
/******/ 							if (options.onUnaccepted) options.onUnaccepted(result);
/******/ 							if (!options.ignoreUnaccepted)
/******/ 								abortError = new Error(
/******/ 									"Aborted because " + moduleId + " is not accepted" + chainInfo
/******/ 								);
/******/ 							break;
/******/ 						case "accepted":
/******/ 							if (options.onAccepted) options.onAccepted(result);
/******/ 							doApply = true;
/******/ 							break;
/******/ 						case "disposed":
/******/ 							if (options.onDisposed) options.onDisposed(result);
/******/ 							doDispose = true;
/******/ 							break;
/******/ 						default:
/******/ 							throw new Error("Unexception type " + result.type);
/******/ 					}
/******/ 					if (abortError) {
/******/ 						return {
/******/ 							error: abortError
/******/ 						};
/******/ 					}
/******/ 					if (doApply) {
/******/ 						appliedUpdate[moduleId] = newModuleFactory;
/******/ 						addAllToSet(outdatedModules, result.outdatedModules);
/******/ 						for (moduleId in result.outdatedDependencies) {
/******/ 							if (__webpack_require__.o(result.outdatedDependencies, moduleId)) {
/******/ 								if (!outdatedDependencies[moduleId])
/******/ 									outdatedDependencies[moduleId] = [];
/******/ 								addAllToSet(
/******/ 									outdatedDependencies[moduleId],
/******/ 									result.outdatedDependencies[moduleId]
/******/ 								);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 					if (doDispose) {
/******/ 						addAllToSet(outdatedModules, [result.moduleId]);
/******/ 						appliedUpdate[moduleId] = warnUnexpectedRequire;
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 			currentUpdate = undefined;
/******/ 		
/******/ 			// Store self accepted outdated modules to require them later by the module system
/******/ 			var outdatedSelfAcceptedModules = [];
/******/ 			for (var j = 0; j < outdatedModules.length; j++) {
/******/ 				var outdatedModuleId = outdatedModules[j];
/******/ 				var module = __webpack_require__.c[outdatedModuleId];
/******/ 				if (
/******/ 					module &&
/******/ 					(module.hot._selfAccepted || module.hot._main) &&
/******/ 					// removed self-accepted modules should not be required
/******/ 					appliedUpdate[outdatedModuleId] !== warnUnexpectedRequire &&
/******/ 					// when called invalidate self-accepting is not possible
/******/ 					!module.hot._selfInvalidated
/******/ 				) {
/******/ 					outdatedSelfAcceptedModules.push({
/******/ 						module: outdatedModuleId,
/******/ 						require: module.hot._requireSelf,
/******/ 						errorHandler: module.hot._selfAccepted
/******/ 					});
/******/ 				}
/******/ 			}
/******/ 		
/******/ 			var moduleOutdatedDependencies;
/******/ 		
/******/ 			return {
/******/ 				dispose: function () {
/******/ 					currentUpdateRemovedChunks.forEach(function (chunkId) {
/******/ 						delete installedChunks[chunkId];
/******/ 					});
/******/ 					currentUpdateRemovedChunks = undefined;
/******/ 		
/******/ 					var idx;
/******/ 					var queue = outdatedModules.slice();
/******/ 					while (queue.length > 0) {
/******/ 						var moduleId = queue.pop();
/******/ 						var module = __webpack_require__.c[moduleId];
/******/ 						if (!module) continue;
/******/ 		
/******/ 						var data = {};
/******/ 		
/******/ 						// Call dispose handlers
/******/ 						var disposeHandlers = module.hot._disposeHandlers;
/******/ 						for (j = 0; j < disposeHandlers.length; j++) {
/******/ 							disposeHandlers[j].call(null, data);
/******/ 						}
/******/ 						__webpack_require__.hmrD[moduleId] = data;
/******/ 		
/******/ 						// disable module (this disables requires from this module)
/******/ 						module.hot.active = false;
/******/ 		
/******/ 						// remove module from cache
/******/ 						delete __webpack_require__.c[moduleId];
/******/ 		
/******/ 						// when disposing there is no need to call dispose handler
/******/ 						delete outdatedDependencies[moduleId];
/******/ 		
/******/ 						// remove "parents" references from all children
/******/ 						for (j = 0; j < module.children.length; j++) {
/******/ 							var child = __webpack_require__.c[module.children[j]];
/******/ 							if (!child) continue;
/******/ 							idx = child.parents.indexOf(moduleId);
/******/ 							if (idx >= 0) {
/******/ 								child.parents.splice(idx, 1);
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// remove outdated dependency from module children
/******/ 					var dependency;
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								for (j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									dependency = moduleOutdatedDependencies[j];
/******/ 									idx = module.children.indexOf(dependency);
/******/ 									if (idx >= 0) module.children.splice(idx, 1);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 				},
/******/ 				apply: function (reportError) {
/******/ 					// insert new code
/******/ 					for (var updateModuleId in appliedUpdate) {
/******/ 						if (__webpack_require__.o(appliedUpdate, updateModuleId)) {
/******/ 							__webpack_require__.m[updateModuleId] = appliedUpdate[updateModuleId];
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// run new runtime modules
/******/ 					for (var i = 0; i < currentUpdateRuntime.length; i++) {
/******/ 						currentUpdateRuntime[i](__webpack_require__);
/******/ 					}
/******/ 		
/******/ 					// call accept handlers
/******/ 					for (var outdatedModuleId in outdatedDependencies) {
/******/ 						if (__webpack_require__.o(outdatedDependencies, outdatedModuleId)) {
/******/ 							var module = __webpack_require__.c[outdatedModuleId];
/******/ 							if (module) {
/******/ 								moduleOutdatedDependencies =
/******/ 									outdatedDependencies[outdatedModuleId];
/******/ 								var callbacks = [];
/******/ 								var errorHandlers = [];
/******/ 								var dependenciesForCallbacks = [];
/******/ 								for (var j = 0; j < moduleOutdatedDependencies.length; j++) {
/******/ 									var dependency = moduleOutdatedDependencies[j];
/******/ 									var acceptCallback =
/******/ 										module.hot._acceptedDependencies[dependency];
/******/ 									var errorHandler =
/******/ 										module.hot._acceptedErrorHandlers[dependency];
/******/ 									if (acceptCallback) {
/******/ 										if (callbacks.indexOf(acceptCallback) !== -1) continue;
/******/ 										callbacks.push(acceptCallback);
/******/ 										errorHandlers.push(errorHandler);
/******/ 										dependenciesForCallbacks.push(dependency);
/******/ 									}
/******/ 								}
/******/ 								for (var k = 0; k < callbacks.length; k++) {
/******/ 									try {
/******/ 										callbacks[k].call(null, moduleOutdatedDependencies);
/******/ 									} catch (err) {
/******/ 										if (typeof errorHandlers[k] === "function") {
/******/ 											try {
/******/ 												errorHandlers[k](err, {
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k]
/******/ 												});
/******/ 											} catch (err2) {
/******/ 												if (options.onErrored) {
/******/ 													options.onErrored({
/******/ 														type: "accept-error-handler-errored",
/******/ 														moduleId: outdatedModuleId,
/******/ 														dependencyId: dependenciesForCallbacks[k],
/******/ 														error: err2,
/******/ 														originalError: err
/******/ 													});
/******/ 												}
/******/ 												if (!options.ignoreErrored) {
/******/ 													reportError(err2);
/******/ 													reportError(err);
/******/ 												}
/******/ 											}
/******/ 										} else {
/******/ 											if (options.onErrored) {
/******/ 												options.onErrored({
/******/ 													type: "accept-errored",
/******/ 													moduleId: outdatedModuleId,
/******/ 													dependencyId: dependenciesForCallbacks[k],
/******/ 													error: err
/******/ 												});
/******/ 											}
/******/ 											if (!options.ignoreErrored) {
/******/ 												reportError(err);
/******/ 											}
/******/ 										}
/******/ 									}
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					// Load self accepted modules
/******/ 					for (var o = 0; o < outdatedSelfAcceptedModules.length; o++) {
/******/ 						var item = outdatedSelfAcceptedModules[o];
/******/ 						var moduleId = item.module;
/******/ 						try {
/******/ 							item.require(moduleId);
/******/ 						} catch (err) {
/******/ 							if (typeof item.errorHandler === "function") {
/******/ 								try {
/******/ 									item.errorHandler(err, {
/******/ 										moduleId: moduleId,
/******/ 										module: __webpack_require__.c[moduleId]
/******/ 									});
/******/ 								} catch (err1) {
/******/ 									if (options.onErrored) {
/******/ 										options.onErrored({
/******/ 											type: "self-accept-error-handler-errored",
/******/ 											moduleId: moduleId,
/******/ 											error: err1,
/******/ 											originalError: err
/******/ 										});
/******/ 									}
/******/ 									if (!options.ignoreErrored) {
/******/ 										reportError(err1);
/******/ 										reportError(err);
/******/ 									}
/******/ 								}
/******/ 							} else {
/******/ 								if (options.onErrored) {
/******/ 									options.onErrored({
/******/ 										type: "self-accept-errored",
/******/ 										moduleId: moduleId,
/******/ 										error: err
/******/ 									});
/******/ 								}
/******/ 								if (!options.ignoreErrored) {
/******/ 									reportError(err);
/******/ 								}
/******/ 							}
/******/ 						}
/******/ 					}
/******/ 		
/******/ 					return outdatedModules;
/******/ 				}
/******/ 			};
/******/ 		}
/******/ 		__webpack_require__.hmrI.importScripts = function (moduleId, applyHandlers) {
/******/ 			if (!currentUpdate) {
/******/ 				currentUpdate = {};
/******/ 				currentUpdateRuntime = [];
/******/ 				currentUpdateRemovedChunks = [];
/******/ 				applyHandlers.push(applyHandler);
/******/ 			}
/******/ 			if (!__webpack_require__.o(currentUpdate, moduleId)) {
/******/ 				currentUpdate[moduleId] = __webpack_require__.m[moduleId];
/******/ 			}
/******/ 		};
/******/ 		__webpack_require__.hmrC.importScripts = function (
/******/ 			chunkIds,
/******/ 			removedChunks,
/******/ 			removedModules,
/******/ 			promises,
/******/ 			applyHandlers,
/******/ 			updatedModulesList
/******/ 		) {
/******/ 			applyHandlers.push(applyHandler);
/******/ 			currentUpdateChunks = {};
/******/ 			currentUpdateRemovedChunks = removedChunks;
/******/ 			currentUpdate = removedModules.reduce(function (obj, key) {
/******/ 				obj[key] = false;
/******/ 				return obj;
/******/ 			}, {});
/******/ 			currentUpdateRuntime = [];
/******/ 			chunkIds.forEach(function (chunkId) {
/******/ 				if (
/******/ 					__webpack_require__.o(installedChunks, chunkId) &&
/******/ 					installedChunks[chunkId] !== undefined
/******/ 				) {
/******/ 					promises.push(loadUpdateChunk(chunkId, updatedModulesList));
/******/ 					currentUpdateChunks[chunkId] = true;
/******/ 				} else {
/******/ 					currentUpdateChunks[chunkId] = false;
/******/ 				}
/******/ 			});
/******/ 			if (__webpack_require__.f) {
/******/ 				__webpack_require__.f.importScriptsHmr = function (chunkId, promises) {
/******/ 					if (
/******/ 						currentUpdateChunks &&
/******/ 						__webpack_require__.o(currentUpdateChunks, chunkId) &&
/******/ 						!currentUpdateChunks[chunkId]
/******/ 					) {
/******/ 						promises.push(loadUpdateChunk(chunkId));
/******/ 						currentUpdateChunks[chunkId] = true;
/******/ 					}
/******/ 				};
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		__webpack_require__.hmrM = () => {
/******/ 			if (typeof fetch === "undefined") throw new Error("No browser support: need fetch API");
/******/ 			return fetch(__webpack_require__.p + __webpack_require__.hmrF()).then((response) => {
/******/ 				if(response.status === 404) return; // no update available
/******/ 				if(!response.ok) throw new Error("Failed to fetch update manifest " + response.statusText);
/******/ 				return response.json();
/******/ 			});
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// module cache are used so entry inlining is disabled
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	var __webpack_exports__ = __webpack_require__("(app-pages-browser)/./app/workers/networkWorker.js");
/******/ 	_N_E = __webpack_exports__;
/******/ 	
/******/ })()
;