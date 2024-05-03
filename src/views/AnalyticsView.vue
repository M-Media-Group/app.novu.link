<script setup lang="ts">
import axios from "axios";
import { computed, onMounted, ref, watch } from "vue";
import type { Analytics } from "@/types/analytics";
import BarChart from "@/components/charts/BarChart.vue";
import LineChart from "@/components/charts/LineChart.vue";
import PieChart from "@/components/charts/PieChart.vue";
import CardElement from "@/components/CardElement.vue";
import DropdownSelect from "@/components/DropdownSelect.vue";
import type { selectOption } from "@/types/listItem";
import BaseButton from "@/components/BaseButton.vue";
import { removeProtocol } from "@/helpers/urlFormatter";
import { useI18n } from "vue-i18n";

const data = ref([] as Analytics[]);
const loading = ref(false);

const { t } = useI18n();

const getData = async (startDate?: string, endDate?: string) => {
  loading.value = true;
  const withCount = ["clicks", "endpoints", "uniqueClicks", "todaysClicks"];
  const withData = [
    "clicksByTimeOfDay",
    "clickReferers",
    "clickCountries",
    "languages",
  ];

  const response = await axios.get("/api/v1/redirects/analytics", {
    params: {
      // Needs to be passed as an array
      withCount,
      with: withData,
      startDate: startDate ? `${startDate}T00:00:00` : undefined,
      // Make the end date the last hour of the day
      endDate: endDate ? `${endDate}T23:59:59` : undefined,
    },
  });
  data.value = response.data as Analytics[];
  loading.value = false;
};

onMounted(() => {
  getData(filterValue.value[1], filterValue.value[2]);
});

const clickData = computed(() => {
  return data.value
    .map((item) => ({ name: item.name, count: item.clicks_count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, parseInt(filterValue.value[0]));
});

const lineChartData = computed(() => {
  // Each data item has a clicks_by_time_of_day array, we need to return it. We can flatten the array with flatMap
  const flatData = data.value.flatMap((item) => item.clicks_by_time_of_day);
  // Sum for each datetime, discard the redirect_uuid
  const groupedData = flatData.reduce((acc, item) => {
    if (!item) {
      return acc;
    }
    const key = item.datetime;
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += item.click_count;
    return acc;
  }, {} as Record<string, number>);
  const newData = Object.entries(groupedData)
    .map(([datetime, clickCount]) => ({
      // The name is the datetime, but we need to convert it to local hour by adding or subtracting the timezone offset from GMT. The datetime current format is hh:mm
      name: new Date(`2023-03-03T${datetime}:00Z`).toLocaleTimeString(
        undefined,
        {
          hour: "numeric",
          hour12: false,
        }
      ),
      count: clickCount,
    }))
    // Since the data is hourly, sort and fill in the missing hours with 0
    // First, sort by the hour
    .sort((a, b) => {
      const aHour = parseInt(a.name.split(":")[0]);
      const bHour = parseInt(b.name.split(":")[0]);
      return aHour - bHour;
    });

  // Fill in the missing hours
  const hours = Array.from({ length: 24 }, (_, i) =>
    i.toString().padStart(2, "0")
  );
  const filledData = hours.map((hour) => {
    const found = newData.find((item) => item.name.startsWith(hour));
    if (found) {
      return found;
    }
    return {
      name: hour,
      count: 0,
    };
  });

  return filledData;
});

const uniqueReferersAndClicks = computed(() => {
  // In each item we have a ClickReferer array, each havving a referer, redirect_uuid, and a click_count
  const flatData = data.value.flatMap((item) => item.click_referers);
  // We need to group by referer and sum the click_count
  const groupedData = flatData.reduce((acc, item) => {
    if (!item) {
      return acc;
    }
    const key = item.referer ?? "QR code";
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += item.referer_count;
    return acc;
  }, {} as Record<string, number>);
  const dataFetched = Object.entries(groupedData)
    .map(([referer, clickCount]) => ({
      referer,
      clickCount,
    }))
    .sort((a, b) => b.clickCount - a.clickCount)
    .slice(0, parseInt(filterValue.value[0]));

  // Return ready for bar-chart
  return dataFetched.map((item) => ({
    name: removeProtocol(item.referer),
    count: item.clickCount,
  }));
});

const uniqueCountries = computed(() => {
  const flatData = data.value.flatMap((item) => item.click_countries);
  const groupedData = flatData.reduce((acc, item) => {
    if (!item) {
      return acc;
    }
    const key = item.country ?? "Unknown";
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += item.click_count;
    return acc;
  }, {} as Record<string, number>);
  return (
    Object.entries(groupedData)
      .map(([country, clickCount]) => ({
        name: country,
        count: clickCount,
      }))
      .sort((a, b) => b.count - a.count)
      // We will return a single array with the top 5 countries and the rest as "Others"
      .reduce(
        (acc, item, index) => {
          if (index < parseInt(filterValue.value[0])) {
            acc.push(item);
          } else {
            acc[5].count += item.count;
          }
          return acc;
        },
        [{ name: "Others", count: 0 }] as {
          name: string;
          count: number;
        }[]
      )
  );
});

const uniqueLanguages = computed(() => {
  const flatData = data.value.flatMap((item) => item.languages);
  const groupedData = flatData.reduce((acc, item) => {
    if (!item) {
      return acc;
    }
    const key = item.language_code ?? "Unknown";
    if (!acc[key]) {
      acc[key] = 0;
    }
    acc[key] += item?.count ?? 0;
    return acc;
  }, {} as Record<string, number>);
  return Object.entries(groupedData)
    .map(([language, clickCount]) => ({
      name: language,
      count: clickCount,
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, parseInt(filterValue.value[0]));
});

const today = new Date().toISOString().split("T")[0];

/**
 * The dropwdown select options, which will contain inputs for filtering the analytics data. For now, the dropwdonw should contain  2 date inputs, one for the from date and one for the to date.
 */
const dropdownOptions = ref([
  // A select with preselcted limit options on how many redirects to show - default to top 30 items
  {
    render: "preset",
    id: "preset",
    raw: {
      label: t("Limit"),
      options: [
        { label: "Top 5", value: 5 },
        { label: "Top 10", value: 10 },
        { label: "Top 20", value: 20 },
        { label: "Top 30", value: 30, selected: true },
        { label: "Top 40", value: 40 },
        { label: "Top 50", value: 50 },
      ],
    },
  },
  {
    render: "fromDate",
    id: "fromDate",
    raw: {
      label: t("From"),
      type: "date",
      max: today,
    },
  },
  {
    render: "toDate",
    id: "toDate",
    raw: {
      label: t("To"),
      type: "date",
      max: today,
    },
  },
] as selectOption[]);

const filterValue = ref([
  "30",
  // One month ago
  new Date(new Date().setMonth(new Date().getMonth() - 1))
    .toISOString()
    .split("T")[0],
  today,
]);

// Watch for changes in the filter value
watch(filterValue, ([_limit, fromDate, toDate]) => {
  getData(fromDate, toDate);
});
</script>
<template>
  <div>
    <div class="two-column-grid">
      <hgroup>
        <h1>{{ $t("Analytics") }}</h1>
        <p>{{ $t("Scans all time") }}</p>
      </hgroup>
      <div>
        <dropdown-select
          :options="dropdownOptions"
          placeholder="Filter"
          v-model="filterValue"
          :multiple="true"
        >
          <template
            #optionSlot="{ option, updateModelValue, modelValue, index }"
          >
            <label :for="option.id">{{ option.raw.label }}</label>
            <template v-if="option.render === 'preset'">
              <select
                :id="option.id"
                @input="updateModelValue($event, index)"
                :value="modelValue[index]"
              >
                <option
                  v-for="preset in option.raw.options"
                  :key="preset.value"
                  :value="preset.value"
                >
                  {{ preset.label }}
                </option>
              </select>
            </template>
            <template v-else-if="option.render === 'button'">
              <base-button @click="updateModelValue($event, index)">
                {{ option.raw.label }}
              </base-button>
            </template>
            <input
              v-else
              :id="option.id"
              :type="option.raw.type"
              @input="updateModelValue($event, index)"
              :value="modelValue[index]"
              :max="option.raw.max"
            />
          </template>
        </dropdown-select>
      </div>
    </div>
    <card-element :loading="loading">
      <hgroup>
        <h2>{{ $t("Best performing magic links") }}</h2>
        <p>{{ $t("By scans") }}</p>
      </hgroup>

      <bar-chart
        v-if="clickData[0]?.count > 0"
        :clickData="clickData"
      ></bar-chart>
      <div class="placeholder-chart" v-else>
        <p>
          {{
            $t(
              "Enable advanced analytics to see this data, add free destinations, and update the design of your magic link."
            )
          }}
        </p>
      </div>
    </card-element>
    <card-element :loading="loading">
      <hgroup>
        <h2>{{ $t("Scans by time of day") }}</h2>
        <p>{{ $t("By scans") }}</p>
      </hgroup>
      <line-chart v-if="lineChartData.length > 0" :clickData="lineChartData" />
      <div class="placeholder-chart" v-else>
        <p>
          {{
            $t(
              "Enable advanced analytics to see this data, add free destinations, and update the design of your magic link."
            )
          }}
        </p>
      </div>
    </card-element>
    <card-element :loading="loading">
      <hgroup>
        <h2>{{ $t("Unique referers") }}</h2>
        <p>{{ $t("By scans") }}</p>
      </hgroup>
      <bar-chart
        v-if="uniqueReferersAndClicks.length > 0"
        :clickData="uniqueReferersAndClicks"
      ></bar-chart>
      <div class="placeholder-chart" v-else>
        <p>
          {{
            $t(
              "Enable advanced analytics to see this data, add free destinations, and update the design of your magic link."
            )
          }}
        </p>
      </div>
    </card-element>
    <div class="two-column-grid">
      <card-element :loading="loading">
        <hgroup>
          <h2>{{ $t("Scans by country") }}</h2>
          <p>{{ $t("By scans") }}</p>
        </hgroup>
        <pie-chart
          v-if="uniqueCountries.length > 1"
          :clickData="uniqueCountries"
        ></pie-chart>
        <div class="placeholder-chart" v-else>
          <p>
            {{
              $t(
                "Enable advanced analytics to see this data, add free destinations, and update the design of your magic link."
              )
            }}
          </p>
        </div>
      </card-element>
      <card-element :loading="loading">
        <hgroup>
          <h2>{{ $t("Scans by language") }}</h2>
          <p>{{ $t("By scans") }}</p>
        </hgroup>
        <pie-chart
          v-if="uniqueLanguages.length > 0"
          :clickData="uniqueLanguages"
        ></pie-chart>
        <div class="placeholder-chart" v-else>
          <p>
            {{
              $t(
                "Enable advanced analytics to see this data, add free destinations, and update the design of your magic link."
              )
            }}
          </p>
        </div>
      </card-element>
    </div>
  </div>
</template>
