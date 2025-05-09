
# React Native Calendar App 📅

<img src="/UI/Screenshot_20250509_204740.png" width="30%" alt="Month View">

A feature-rich calendar application built with React Native that helps users manage their events and schedules with an intuitive interface.

## Features ✨

- **Multiple Views**: Month, week, and day calendar views
- **Event Management**: Create, read, update, and delete events
- **Beautiful UI**: Modern design with smooth animations
- **Local Storage**: Events persist between app sessions
- **Responsive**: Works on both iOS and Android devices

## Screenshots 📱

<div style="display: flex; justify-content: space-between;">
  <img src="/UI/Screenshot_20250509_204820.png" width="30%" alt="Month View">
  <img src="/UI/Screenshot_20250509_204834.png" width="30%" alt="Day View">
  <img src="/UI/Screenshot_20250509_204855.png" width="30%" alt="Event Details">
</div>

## Tech Stack 💻

- **Framework**: React Native
- **Navigation**: React Navigation
- **State Management**: React Context API
- **Date Handling**: Day.js
- **UI Components**: 
  - React Native Gesture Handler
  - React Native Safe Area Context
  - Lottie for animations
- **Icons**: Expo Vector Icons

## Installation 🛠️

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/react-native-calendar-app.git
   cd react-native-calendar-app
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Run the app:
   ```bash
   expo start
   ```

## Project Structure 🗂️

```
calendar-app/
├── assets/
│   ├── animations/       # Lottie animation files
│   └── images/           # App icons and images
├── components/           # Reusable components
├── context/              # Context providers
├── navigation/           # App navigation setup
├── screens/              # App screens
│   ├── DayViewScreen.js
│   ├── EditEventScreen.js
│   ├── EventDetailScreen.js
│   ├── MonthlyViewScreen.js
│   └── AddEventScreen.js
├── utils/                # Utility functions
│   └── storage.js        # Local storage handling
├── App.js                # Root component
└── README.md             # Project documentation
```

## How to Use 🚀

- **Add Event**: Tap the "+" button on month or day view
- **View Details**: Tap any event to see details
- **Edit Event**: Swipe left on an event and tap edit
- **Delete Event**: Swipe left and tap delete

## Customization 🎨

To customize the app:

- Change colors in styles.js files
- Replace animation files in `assets/animations/`
- Modify the app icons in `assets/images/`

## Contributing 🤝

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -m 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a Pull Request

## License 📜

This project is licensed under the MIT License - see the LICENSE file for details.

## Support 💙

If you like this project, please consider giving it a ⭐ on GitHub!

## Contact 📧

- Email: isuruwickramasinghe.sliate@gmail.com
- GitHub: [@WICKxDEV](https://github.com/WICKxDEV)
