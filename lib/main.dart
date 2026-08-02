import 'package:flutter/material.dart';
import 'package:supabase_flutter/supabase_flutter.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart'; // 1. Import dotenv

import 'config/theme.dart';
import 'splash_screen.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  // 2. Load the environment variables before using them
  await dotenv.load(fileName: ".env");

  // 3. Pass the environment variables to Supabase
  await Supabase.initialize(
    url: dotenv.env['SUPABASE_URL']!,
    anonKey: dotenv.env['SUPABASE_ANON_KEY']!,
  );

  runApp(const BlinkApp());
}

class BlinkApp extends StatelessWidget {
  const BlinkApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Blink',
      debugShowCheckedModeBanner: false,
      theme: blinkTheme,
      home: const SplashScreen(),
    );
  }
}