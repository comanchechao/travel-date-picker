<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import { TransitionRoot } from "@headlessui/vue";
import { onClickOutside } from "@vueuse/core";
import * as jalaali from "jalaali-js";

// Define Persian month names
const persianMonths = [
  "فروردین",
  "اردیبهشت",
  "خرداد",
  "تیر",
  "مرداد",
  "شهریور",
  "مهر",
  "آبان",
  "آذر",
  "دی",
  "بهمن",
  "اسفند",
];

// Define Persian weekday names
const persianWeekdays = ["ش", "ی", "د", "س", "چ", "پ", "ج"];

// State for selected dates
const departureDate = ref<Date | null>(null);
const returnDate = ref<Date | null>(null);
const currentView = ref<"departure" | "return">("departure");
const currentJalaaliDate = ref(jalaali.toJalaali(new Date()));
const isCalendarOpen = ref(false);
const calendarRef = ref<HTMLElement | null>(null);
const passengerCount = ref(1);
const isOneWay = ref(false);

// Generate calendar days for the current month
const calendarDays = computed(() => {
  const { jy: year, jm: month } = currentJalaaliDate.value;

  // Get the first day of the month in Jalaali
  const firstDayOfMonth = jalaali.toGregorian(year, month, 1);
  const firstDayDate = new Date(
    firstDayOfMonth.gy,
    firstDayOfMonth.gm - 1,
    firstDayOfMonth.gd
  );

  // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
  let firstDayOfWeek = firstDayDate.getDay();
  // Adjust for Persian calendar (week starts with Saturday)
  firstDayOfWeek = (firstDayOfWeek + 1) % 7;

  // Calculate the number of days in the current Jalaali month
  const daysInMonth = jalaali.jalaaliMonthLength(year, month);

  const days = [];

  // Add empty cells for days before the first day of the month
  for (let i = 0; i < firstDayOfWeek; i++) {
    days.push({ day: null, isCurrentMonth: false });
  }

  // Add days of the current month
  for (let day = 1; day <= daysInMonth; day++) {
    // Convert Jalaali date to Gregorian for internal date handling
    const gregorianDate = jalaali.toGregorian(year, month, day);
    const date = new Date(
      gregorianDate.gy,
      gregorianDate.gm - 1,
      gregorianDate.gd
    );

    days.push({
      day,
      date,
      isCurrentMonth: true,
      isToday: isToday(date),
      isDepartureDate: isDepartureDate(date),
      isReturnDate: isReturnDate(date),
      isInRange: isInRange(date),
      isDisabled: isDisabled(date),
    });
  }

  return days;
});

// Helper functions
function isToday(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return today.getTime() === date.getTime();
}

function isDepartureDate(date: Date): boolean {
  if (!departureDate.value) return false;
  const d1 = new Date(date);
  const d2 = new Date(departureDate.value);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return d1.getTime() === d2.getTime();
}

function isReturnDate(date: Date): boolean {
  if (!returnDate.value) return false;
  const d1 = new Date(date);
  const d2 = new Date(returnDate.value);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return d1.getTime() === d2.getTime();
}

function isInRange(date: Date): boolean {
  if (!departureDate.value || !returnDate.value) return false;
  const d = new Date(date);
  const d1 = new Date(departureDate.value);
  const d2 = new Date(returnDate.value);
  d.setHours(0, 0, 0, 0);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return d > d1 && d < d2;
}

function isDisabled(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  date.setHours(0, 0, 0, 0);
  return date < today;
}

// Helper functions for range styling
function isFirstDayOfRange(date: Date): boolean {
  if (!departureDate.value || !returnDate.value) return false;
  const d1 = new Date(date);
  const d2 = new Date(departureDate.value);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return d1.getTime() === d2.getTime();
}

function isLastDayOfRange(date: Date): boolean {
  if (!departureDate.value || !returnDate.value) return false;
  const d1 = new Date(date);
  const d2 = new Date(returnDate.value);
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  return d1.getTime() === d2.getTime();
}

// Navigation functions
function previousMonth() {
  const { jy, jm } = currentJalaaliDate.value;
  if (jm === 1) {
    // If it's the first month (Farvardin), go to the last month (Esfand) of the previous year
    currentJalaaliDate.value = { jy: jy - 1, jm: 12, jd: 1 };
  } else {
    // Otherwise, go to the previous month
    currentJalaaliDate.value = { jy, jm: jm - 1, jd: 1 };
  }
}

function nextMonth() {
  const { jy, jm } = currentJalaaliDate.value;
  if (jm === 12) {
    // If it's the last month (Esfand), go to the first month (Farvardin) of the next year
    currentJalaaliDate.value = { jy: jy + 1, jm: 1, jd: 1 };
  } else {
    // Otherwise, go to the next month
    currentJalaaliDate.value = { jy, jm: jm + 1, jd: 1 };
  }
}

// Date selection
function selectDate(date: Date) {
  if (isDisabled(date)) return;

  if (currentView.value === "departure") {
    departureDate.value = date;
    // If return date is before departure date, reset it
    if (returnDate.value && returnDate.value < date) {
      returnDate.value = null;
    }

    if (isOneWay.value) {
      // Close calendar after selecting departure date if one-way
      setTimeout(() => {
        isCalendarOpen.value = false;
      }, 300);
    } else {
      currentView.value = "return";
    }
  } else {
    if (date < departureDate.value!) {
      // If selected return date is before departure, swap them
      returnDate.value = departureDate.value;
      departureDate.value = date;
    } else {
      returnDate.value = date;
    }
    // Close calendar after selecting both dates
    setTimeout(() => {
      isCalendarOpen.value = false;
    }, 300);
    currentView.value = "departure";
  }
}

// Format date for display
function formatPersianDate(date: Date | null): string {
  if (!date) return "انتخاب کنید";

  const jDate = jalaali.toJalaali(date);
  const year = jDate.jy;
  const month = persianMonths[jDate.jm - 1]; // jalaali-js months are 1-based
  const day = jDate.jd;

  return `${toPersianDigits(day)} ${month} ${toPersianDigits(year)}`;
}

// Format date for compact display (used in the UI)
function formatCompactDate(date: Date | null): string {
  if (!date) return "انتخاب کنید";

  const jDate = jalaali.toJalaali(date);
  const year = jDate.jy;
  const month = persianMonths[jDate.jm - 1]; // jalaali-js months are 1-based
  const day = jDate.jd;

  return `${toPersianDigits(day)} ${month} ${toPersianDigits(year)}`;
}

// Get current month name
const currentMonthName = computed(() => {
  return persianMonths[currentJalaaliDate.value.jm - 1]; // jalaali-js months are 1-based
});

// Get current year
const currentYear = computed(() => {
  return currentJalaaliDate.value.jy;
});

// Reset selection
function resetSelection() {
  departureDate.value = null;
  returnDate.value = null;
  currentView.value = "departure";
}

// Toggle calendar
function toggleCalendar() {
  isCalendarOpen.value = !isCalendarOpen.value;
}

// Toggle one-way/round-trip
function toggleTripType() {
  isOneWay.value = !isOneWay.value;
  if (isOneWay.value) {
    returnDate.value = null;
  }
}

// Passenger management
function increasePassengers() {
  if (passengerCount.value < 9) {
    passengerCount.value++;
  }
}

function decreasePassengers() {
  if (passengerCount.value > 1) {
    passengerCount.value--;
  }
}

// Convert number to Persian digits
function toPersianDigits(n: number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return n.toString().replace(/\d/g, (x) => persianDigits[parseInt(x)]);
}

// Close calendar when clicking outside
onMounted(() => {
  if (calendarRef.value) {
    onClickOutside(calendarRef, () => {
      isCalendarOpen.value = false;
    });
  }
});

// Watch for changes in selected dates
watch([departureDate, returnDate], () => {
  // You can add additional logic here if needed
});

// Confirm selection
function confirmSelection() {
  isCalendarOpen.value = false;
  // Here you can add logic to handle the confirmed dates
  // For example, emit an event with the selected dates
}

// Search function
function search() {
  // Here you would implement the search functionality
  console.log("Searching with dates:", {
    departure: departureDate.value,
    return: isOneWay.value ? null : returnDate.value,
    passengers: passengerCount.value,
    isOneWay: isOneWay.value,
  });
  // You could emit an event with the search parameters
}
</script>

<template>
  <div class="date-picker">
    <div class="bg-[#1a7cff] p-5 rounded-lg shadow-md">
      <h2 class="text-xl font-bold text-white mb-5 text-center">
        انتخاب تاریخ سفر
      </h2>

      <div class="grid grid-cols-2 gap-3 mb-4">
        <!-- Departure Date Selector -->
        <div
          class="relative"
          @click="
            () => {
              isCalendarOpen = true;
              currentView = 'departure';
            }
          "
        >
          <div
            class="w-full bg-white rounded-lg p-3 text-center transition duration-300 hover:shadow-md focus:outline-none cursor-pointer"
            :class="{
              'ring-2 ring-[#1a7cff] shadow-md':
                currentView === 'departure' && isCalendarOpen,
              'border-2 border-[#1a7cff]': departureDate !== null,
            }"
          >
            <div class="flex flex-col items-center">
              <span class="text-xs text-gray-500 mb-1">تاریخ رفت</span>
              <div class="flex items-center">
                <span class="text-[#1a7cff] ml-1">📅</span>
                <span class="font-bold text-gray-800 text-sm">{{
                  departureDate
                    ? formatCompactDate(departureDate)
                    : "انتخاب کنید"
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Return Date Selector -->
        <div
          class="relative"
          @click="
            () => {
              if (!isOneWay) {
                isCalendarOpen = true;
                currentView = 'return';
              }
            }
          "
        >
          <div
            class="w-full bg-white rounded-lg p-3 text-center transition duration-300 hover:shadow-md focus:outline-none cursor-pointer"
            :class="{
              'ring-2 ring-[#1a7cff] shadow-md':
                currentView === 'return' && isCalendarOpen,
              'opacity-50': isOneWay,
              'border-2 border-[#1a7cff]': returnDate !== null && !isOneWay,
            }"
          >
            <div class="flex flex-col items-center">
              <span class="text-xs text-gray-500 mb-1">تاریخ برگشت</span>
              <div class="flex items-center">
                <span class="text-[#1a7cff] ml-1">📅</span>
                <span class="font-bold text-gray-800 text-sm">{{
                  isOneWay
                    ? "بدون برگشت"
                    : returnDate
                    ? formatCompactDate(returnDate)
                    : "انتخاب کنید"
                }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Search Button -->
      <button
        @click="search"
        class="w-full py-2 px-6 bg-black text-white font-bold rounded-lg transition duration-300 transform hover:scale-[1.02] active:scale-[0.98] mb-4 shadow-md"
      >
        <div class="flex items-center justify-center">
          <span class="ml-2">🔍</span>
          <span>جستجو</span>
        </div>
      </button>

      <!-- Trip Type Toggle -->
      <div class="flex justify-center mb-4">
        <div class="gap-2 rounded-full p-1 flex w-full">
          <button
            @click="toggleTripType"
            class="py-1 px-3 rounded-full transition-all duration-300 text-xs font-medium flex-1 flex items-center justify-center"
            :class="
              !isOneWay ? 'bg-white text-gray-700 shadow-md' : 'text-white'
            "
          >
            <span class="ml-1">🔄</span>
            <span>رفت و برگشت</span>
          </button>
          <button
            @click="toggleTripType"
            class="py-1 px-3 rounded-full transition-all duration-300 text-xs font-medium flex-1 flex items-center justify-center"
            :class="
              isOneWay ? 'bg-white text-gray-700 shadow-md' : 'text-white'
            "
          >
            <span class="ml-1">➡️</span>
            <span>یک طرفه</span>
          </button>
        </div>
      </div>

      <!-- Calendar -->
      <TransitionRoot
        :show="isCalendarOpen"
        enter="transition ease-out duration-300"
        enter-from="opacity-0 translate-y-4"
        enter-to="opacity-100 translate-y-0"
        leave="transition ease-in duration-200"
        leave-from="opacity-100 translate-y-0"
        leave-to="opacity-0 translate-y-4"
        as="template"
      >
        <div class="calendar-overlay">
          <div
            ref="calendarRef"
            class="calendar-container bg-white rounded-lg overflow-hidden shadow-2xl"
          >
            <!-- Calendar Header -->
            <div
              class="py-2 px-3 bg-[#1a7cff] text-white flex justify-between items-center"
            >
              <button
                @click="nextMonth"
                class="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition duration-200 w-8 h-8 flex items-center justify-center"
              >
                <span class="text-xl font-bold">◀</span>
              </button>

              <div class="text-base font-bold text-center">
                {{ persianMonths[currentJalaaliDate.jm - 1] }}
                {{ toPersianDigits(currentJalaaliDate.jy) }}
              </div>

              <button
                @click="previousMonth"
                class="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition duration-200 w-8 h-8 flex items-center justify-center"
              >
                <span class="text-xl font-bold">▶</span>
              </button>
            </div>

            <!-- Weekday Headers -->
            <div class="grid grid-cols-7">
              <div
                v-for="(day, index) in persianWeekdays"
                :key="index"
                class="py-2 text-center text-gray-700 font-medium text-xs border-b"
              >
                {{ day }}
              </div>
            </div>

            <!-- Calendar Days -->
            <div class="grid grid-cols-7">
              <div
                v-for="(day, index) in calendarDays"
                :key="index"
                class="aspect-square flex items-center justify-center relative transition-all duration-200"
                :class="{
                  'opacity-50': !day.isCurrentMonth,
                  'cursor-pointer': day.isCurrentMonth && !day.isDisabled,
                  'cursor-not-allowed': day.isDisabled,
                }"
                @click="
                  day.isCurrentMonth && !day.isDisabled && day.date
                    ? selectDate(day.date)
                    : null
                "
              >
                <div
                  class="relative z-10 w-full h-full flex items-center justify-center"
                >
                  <span
                    class="text-sm transition-all duration-200 w-full h-full flex items-center justify-center"
                    :class="{
                      'text-white bg-[#1a7cff]':
                        day.isDepartureDate || day.isReturnDate,
                      'bg-gray-200':
                        day.isToday &&
                        !day.isDepartureDate &&
                        !day.isReturnDate,
                      'bg-[#1a7cff] text-white': day.isInRange,
                    }"
                  >
                    {{ day.day ? toPersianDigits(day.day) : "" }}
                  </span>

                  <!-- Tooltips -->
                  <div
                    v-if="day.isDepartureDate"
                    class="tooltip departure-tooltip"
                  >
                    تاریخ رفت
                  </div>
                  <div v-if="day.isReturnDate" class="tooltip return-tooltip">
                    تاریخ برگشت
                  </div>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="p-3 bg-white border-t flex justify-between">
              <button
                @click="resetSelection"
                class="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition duration-200 flex items-center bg-gray-100 rounded-md"
              >
                <span>پاک کردن</span>
              </button>

              <button
                @click="confirmSelection"
                class="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition duration-200 text-sm flex items-center"
              >
                <span>تایید</span>
              </button>
            </div>
          </div>
        </div>
      </TransitionRoot>

      <!-- Passenger Count -->
      <div class="bg-white rounded-lg p-3 shadow-md">
        <div class="text-xs text-gray-500 mb-1">تعداد مسافران</div>
        <div class="flex justify-between items-center">
          <div class="font-bold text-gray-800 text-sm flex items-center">
            <span class="ml-1">👤</span>
            <span>{{ toPersianDigits(passengerCount) }} مسافر</span>
          </div>
          <div class="flex items-center gap-2">
            <button
              @click="decreasePassengers"
              class="w-7 h-7 rounded-md bg-black flex items-center justify-center hover:bg-gray-800 transition duration-200 active:scale-95"
              :disabled="passengerCount <= 1"
              :class="{ 'opacity-50 cursor-not-allowed': passengerCount <= 1 }"
            >
              <span class="text-white font-bold text-lg leading-none">-</span>
            </button>
            <button
              @click="increasePassengers"
              class="w-7 h-7 rounded-md bg-black flex items-center justify-center hover:bg-gray-800 transition duration-200 active:scale-95"
              :disabled="passengerCount >= 9"
              :class="{ 'opacity-50 cursor-not-allowed': passengerCount >= 9 }"
            >
              <span class="text-white font-bold text-lg leading-none">+</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.date-picker {
  width: 100%;
}

.calendar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 50;
  padding: 1rem;
}

.calendar-container {
  width: 100%;
  max-width: 420px;
  max-height: 90vh;
  overflow-y: auto;
}

/* Add smooth transitions for all interactive elements */
button {
  transition: all 0.2s ease;
}

.calendar-enter-active,
.calendar-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}

.calendar-enter-from,
.calendar-leave-to {
  opacity: 0;
  transform: translateY(10px);
}

/* Improve day selection styling */
.aspect-square {
  position: relative;
  padding: 0.25rem;
}

.aspect-square::before {
  content: "";
  display: block;
  padding-bottom: 100%;
}

.aspect-square > * {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Calendar styling to match the image */
.aspect-square span {
  border-radius: 0;
}

/* Make the calendar match the image */
.grid-cols-7 {
  border-collapse: collapse;
}

.aspect-square {
  border: none;
  position: relative;
  padding: 0;
}

.aspect-square > div {
  padding: 0;
}

.aspect-square span {
  font-size: 14px;
}

/* Tooltip styling */
.tooltip {
  position: absolute;
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 10px;
  white-space: nowrap;
  z-index: 20;
  opacity: 0;
  transition: opacity 0.3s;
  pointer-events: none;
}

.aspect-square:hover .tooltip {
  opacity: 1;
}
</style>
