Directory Structure:

└── ./
    ├── app
    │   ├── (api)
    │   │   ├── (stripe)
    │   │   │   ├── create+api.ts
    │   │   │   └── pay+api.ts
    │   │   ├── ride
    │   │   │   ├── [id]+api.ts
    │   │   │   └── create+api.ts
    │   │   ├── driver+api.ts
    │   │   └── user+api.ts
    │   ├── (auth)
    │   │   ├── _layout.tsx
    │   │   ├── sign-in.tsx
    │   │   ├── sign-up.tsx
    │   │   └── welcome.tsx
    │   ├── (root)
    │   │   ├── (tabs)
    │   │   │   ├── _layout.tsx
    │   │   │   ├── chat.tsx
    │   │   │   ├── home.tsx
    │   │   │   ├── profile.tsx
    │   │   │   └── rides.tsx
    │   │   ├── _layout.tsx
    │   │   ├── book-ride.tsx
    │   │   ├── confirm-ride.tsx
    │   │   └── find-ride.tsx
    │   ├── _layout.tsx
    │   ├── +html.tsx
    │   ├── +not-found.tsx
    │   └── index.tsx
    ├── components
    │   ├── CustomButton.tsx
    │   ├── DriverCard.tsx
    │   ├── GoogleTextInput.tsx
    │   ├── InputField.tsx
    │   ├── Map.tsx
    │   ├── OAuth.tsx
    │   ├── Payment.tsx
    │   ├── RideCard.tsx
    │   └── RideLayout.tsx
    ├── constants
    │   └── index.ts
    ├── lib
    │   ├── auth.ts
    │   ├── fetch.ts
    │   ├── map.ts
    │   └── utils.ts
    ├── scripts
    │   └── reset-project.js
    ├── store
    │   └── index.ts
    ├── types
    │   ├── image.s.ts
    │   └── type.d.ts
    ├── babel.config.js
    ├── nativewind-env.d.ts
    └── tailwind.config.js



---
File: /app/(api)/(stripe)/create+api.ts
---

import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, amount } = body;

  if (!name || !email || !amount) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), {
      status: 400,
    });
  }

  let customer;
  const doesCustomerExist = await stripe.customers.list({
    email,
  });

  if (doesCustomerExist.data.length > 0) {
    customer = doesCustomerExist.data[0];
  } else {
    const newCustomer = await stripe.customers.create({
      name,
      email,
    });

    customer = newCustomer;
  }

  const ephemeralKey = await stripe.ephemeralKeys.create(
    { customer: customer.id },
    { apiVersion: "2024-06-20" },
  );

  const paymentIntent = await stripe.paymentIntents.create({
    amount: parseInt(amount) * 100,
    currency: "usd",
    customer: customer.id,
    automatic_payment_methods: {
      enabled: true,
      allow_redirects: "never",
    },
  });

  return new Response(
    JSON.stringify({
      paymentIntent: paymentIntent,
      ephemeralKey: ephemeralKey,
      customer: customer.id,
    }),
  );
}


---
File: /app/(api)/(stripe)/pay+api.ts
---

import { Stripe } from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { payment_method_id, payment_intent_id, customer_id, client_secret } =
      body;

    if (!payment_method_id || !payment_intent_id || !customer_id) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400 },
      );
    }

    const paymentMethod = await stripe.paymentMethods.attach(
      payment_method_id,
      { customer: customer_id },
    );

    const result = await stripe.paymentIntents.confirm(payment_intent_id, {
      payment_method: paymentMethod.id,
    });

    return new Response(
      JSON.stringify({
        success: true,
        message: "Payment successful",
        result: result,
      }),
    );
  } catch (error) {
    console.error("Error paying:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
    });
  }
}


---
File: /app/(api)/ride/[id]+api.ts
---

import {neon} from "@neondatabase/serverless";

export async function GET(request: Request, {id}: { id: string }) {
    if (!id)
        return Response.json({error: "Missing required fields"}, {status: 400});

    try {
        const sql = neon(`${process.env.DATABASE_URL}`);
        const response = await sql`
        SELECT
            rides.ride_id,
            rides.origin_address,
            rides.destination_address,
            rides.origin_latitude,
            rides.origin_longitude,
            rides.destination_latitude,
            rides.destination_longitude,
            rides.ride_time,
            rides.fare_price,
            rides.payment_status,
            rides.created_at,
            'driver', json_build_object(
                'driver_id', drivers.id,
                'first_name', drivers.first_name,
                'last_name', drivers.last_name,
                'profile_image_url', drivers.profile_image_url,
                'car_image_url', drivers.car_image_url,
                'car_seats', drivers.car_seats,
                'rating', drivers.rating
            ) AS driver 
        FROM 
            rides
        INNER JOIN
            drivers ON rides.driver_id = drivers.id
        WHERE 
            rides.user_id = ${id}
        ORDER BY 
            rides.created_at DESC;
        `;

        return Response.json({data: response});
    } catch (error) {
        console.error("Error fetching recent rides:", error);
        return Response.json({error: "Internal Server Error"}, {status: 500});
    }
}


---
File: /app/(api)/ride/create+api.ts
---

import {neon} from "@neondatabase/serverless";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const {
            origin_address,
            destination_address,
            origin_latitude,
            origin_longitude,
            destination_latitude,
            destination_longitude,
            ride_time,
            fare_price,
            payment_status,
            driver_id,
            user_id,
        } = body;

        if (
            !origin_address ||
            !destination_address ||
            !origin_latitude ||
            !origin_longitude ||
            !destination_latitude ||
            !destination_longitude ||
            !ride_time ||
            !fare_price ||
            !payment_status ||
            !driver_id ||
            !user_id
        ) {
            return Response.json(
                {error: "Missing required fields"},
                {status: 400},
            );
        }

        const sql = neon(`${process.env.DATABASE_URL}`);

        const response = await sql`
        INSERT INTO rides ( 
          origin_address, 
          destination_address, 
          origin_latitude, 
          origin_longitude, 
          destination_latitude, 
          destination_longitude, 
          ride_time, 
          fare_price, 
          payment_status, 
          driver_id, 
          user_id
        ) VALUES (
          ${origin_address},
          ${destination_address},
          ${origin_latitude},
          ${origin_longitude},
          ${destination_latitude},
          ${destination_longitude},
          ${ride_time},
          ${fare_price},
          ${payment_status},
          ${driver_id},
          ${user_id}
        )
        RETURNING *;
        `;

        return Response.json({data: response[0]}, {status: 201});
    } catch (error) {
        console.error("Error inserting data into recent_rides:", error);
        return Response.json({error: "Internal Server Error"}, {status: 500});
    }
}


---
File: /app/(api)/driver+api.ts
---

import { neon } from "@neondatabase/serverless";

export async function GET() {
    try{
        const sql = neon(`${process.env.DATABASE_URL}`);

        const response = await sql `SELECT * FROM drivers`;

        return Response.json({ data: response });
    } catch (error){
        console.log(error);
        return Response.json({ error: error });
    }
}


---
File: /app/(api)/user+api.ts
---

import { neon } from "@neondatabase/serverless";

export async function POST(request: Request) {
  try {
    const sql = neon(`${process.env.DATABASE_URL}`);
    const { name, email, clerkId } = await request.json();

    if (!name || !email || !clerkId) {
      return Response.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const response = await sql`
      INSERT INTO users (
        name, 
        email, 
        clerk_id
      ) 
      VALUES (
        ${name}, 
        ${email},
        ${clerkId}
     );`;

    return new Response(JSON.stringify({ data: response }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error creating user:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


---
File: /app/(auth)/_layout.tsx
---

import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="welcome" options={{ headerShown: false }} />
      <Stack.Screen name="sign-up" options={{ headerShown: false }} />
      <Stack.Screen name="sign-in" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;


---
File: /app/(auth)/sign-in.tsx
---

import CustomButton from "@/components/CustomButton";
import InputField from "@/components/InputField";
import OAut from "@/components/OAuth";
import { icons, images } from "@/constants";
import { Link, useRouter} from "expo-router";
import { useCallback, useState } from "react";
import { Image, ScrollView, Text, View } from "react-native";
import { useSignIn } from '@clerk/clerk-expo'



const SignIn = ()  => {
    const { signIn, setActive, isLoaded } = useSignIn()
    const router = useRouter()
    const [form, setform] = useState({
        email:'',
        password:'',
    });

    const onSignInPress = useCallback(async () => {
        if (!isLoaded) {
          return
        }
    
        try {
          const signInAttempt = await signIn.create({
            identifier: form.email,
            password: form.password,
          })
    
          if (signInAttempt.status === 'complete') {
            await setActive({ session: signInAttempt.createdSessionId })
            router.replace('/')
          } else {
            // See https://clerk.com/docs/custom-flows/error-handling
            // for more info on error handling
            console.error(JSON.stringify(signInAttempt, null, 2))
          }
        } catch (err: any) {
          console.error(JSON.stringify(err, null, 2))
        }
      }, [isLoaded, form.email, form.password])

    return(
        <ScrollView className="flex-1 bg-white">
            <View className="flex-1 bg-white">
                <View className="relative w-full h-[250px]">
                    <Image 
                        source={images.signUpCar} className="z-0 w-full h-[250px]"/>
                        <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">Welcome 👋</Text>
                </View>
                <View className="p-5">
                    <InputField 
                        label="Email"
                        placeholder="Enter Your Email"
                        icon={icons.email}
                        value={form.email}
                        onChangeText={(value) => setform({ ...form, email: value })}
                    />
                    <InputField 
                        label="Password"
                        placeholder="Enter Your Password"
                        icon={icons.lock}
                        secureTextEntry={true}
                        value={form.password}
                        onChangeText={(value) => setform({ ...form, password: value })}
                    />

                    <CustomButton 
                    title="Sign In" 
                    onPress={onSignInPress} 
                    className="mt-6" 
                    />

                    <OAut />

                    <Link 
                    href="/sign-up"
                    className="text-lg text-center text-general-200 mt-10"
                    >
                        <Text>Don't have an account?{" "}</Text>
                        <Text className="text-primary-500">Sign Up</Text>
                    </Link>
                </View>

                {/* Verification modal */}
            </View>
        </ScrollView>
    );
};

export default SignIn;


---
File: /app/(auth)/sign-up.tsx
---

import { useState } from "react";
import OAut from "@/components/OAuth";
import { Link, router } from "expo-router";
import { icons, images } from "@/constants";
import { useSignUp } from "@clerk/clerk-expo";
import InputField from "@/components/InputField";
import ReactNativeModal from "react-native-modal";
import CustomButton from "@/components/CustomButton";
import { Alert, Image, ScrollView, Text, View } from "react-native";
import { fetchAPI } from "@/lib/fetch";


const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [showSuccessModal, setshowSuccessModal] = useState(false);

  const [form, setform] = useState({
    name: '',
    email: '',
    password: '',
  });

  const [verification, setVerification] = useState({
    state: "default",
    error: "",
    code: ""
  });

  const onSignUpPress = async () => {
    if (!isLoaded) {
      return
    }

    try {
      await signUp.create({
        emailAddress: form.email,
        password: form.password,
      });



      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      setVerification({
        ...verification,

        state: "pending"
      })
    } catch (err: any) {
      Alert.alert("Error", err.errors[0].longMessage);
    }
  }

  const onPressVerify = async () => {
    if (!isLoaded) return;

    try {
      const completeSignUp = await signUp
        .attemptEmailAddressVerification({
          code: verification.code,
        });

      if (completeSignUp.status === 'complete') {
        await fetchAPI('/(api)/user', {
          method : "POST",
          body: JSON.stringify({
            name: form.name,
            email: form.email,
            clerkId: completeSignUp.createdUserId,
          }),
        });


        await setActive({ session: completeSignUp.createdSessionId })
        setVerification({ ...verification, state: "success" })
      } else {
        setVerification({ ...verification, error: "Verification Failed", state: "failed" })
      }
    } catch (err: any) {
      setVerification({ ...verification, error: err.errors[0].longMessage, state: "failed" })
    }
  }


  return (
    <ScrollView className="flex-1 bg-white">
      <View className="flex-1 bg-white">
        <View className="relative w-full h-[250px]">
          <Image
            source={images.signUpCar} className="z-0 w-full h-[250px]" />
          <Text className="text-2xl text-black font-JakartaSemiBold absolute bottom-5 left-5">Create Your Account</Text>
        </View>
        <View className="p-5">
          <InputField
            label="Name"
            placeholder="Enter Your Name"
            icon={icons.person}
            value={form.name}
            onChangeText={(value) => setform({ ...form, name: value })}
          />
          <InputField
            label="Email"
            placeholder="Enter Your Email"
            icon={icons.email}
            value={form.email}
            onChangeText={(value) => setform({ ...form, email: value })}
          />
          <InputField
            label="Password"
            placeholder="Enter Your Password"
            icon={icons.lock}
            secureTextEntry={true}
            value={form.password}
            onChangeText={(value) => setform({ ...form, password: value })}
          />

          <CustomButton
            title="Sign Up"
            onPress={onSignUpPress}
            className="mt-6"
          />

          <OAut />

          <Link
            href="/sign-in"
            className="text-lg text-center text-general-200 mt-6"
          >
            <Text>Already have an account?{" "}</Text>
            <Text className="text-primary-500">LogIn</Text>
          </Link>
        </View>

        <ReactNativeModal
          isVisible={verification.state === "pending"}
          onModalHide={() =>{
            if(verification.state === "success") setshowSuccessModal(true)
          }}
        >
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Text className="text-2xl font-JakartaExtraBold mb-2">
              verification
            </Text>
            <Text className="font-Jakarta mb-5">
              We've sent a verification code to {form.email}
            </Text>

            <InputField
              label="code"
              icon={icons.lock}
              placeholder="12345"
              value={verification.code}
              keyboardType="numeric"
              onChangeText={(code) => setVerification({ ...verification, code })
              }
            />

            {verification.error && (
              <Text className="text-red-500 text-sm mt-1">
                {verification.error}
              </Text>
            )}

            <CustomButton 
            title="Verify Email" 
            onPress={onPressVerify} 
            className="mt-5 bg-success-500" 
            />
          </View>
        </ReactNativeModal>
        <ReactNativeModal isVisible={showSuccessModal}>
          <View className="bg-white px-7 py-9 rounded-2xl min-h-[300px]">
            <Image
              source={images.check}
              className="w-[110px] h-[110px] mx-auto my-5"
            />
            <Text className="text-3xl font-JakartaBold text-center">
              Verified
            </Text>
            <Text className="text-base text-gray-400 font-Jakarta text-center mt-2">
              You have successfully verified your account.
            </Text>

            <CustomButton
              title="Browse Home"
              onPress={() => {
                setshowSuccessModal(false);
                router.push("/(root)/(tabs)/home")}}
              className="mt-5"
            />

          </View>
        </ReactNativeModal>
      </View>
    </ScrollView>
  );
};

export default SignUp;

function setVerification(arg0: any) {
  throw new Error("Function not implemented.");
}



---
File: /app/(auth)/welcome.tsx
---

import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Swiper from "react-native-swiper";
import { useRef, useState } from "react";
import { onboarding } from "@/constants";
import CustomButton from "@/components/CustomButton";

const Onboarding = ()  => {
    const swiperRef = useRef<Swiper>(null); 
    const [activeIndex, setactiveIndex] = useState(0);
    const isLastSlide = activeIndex === onboarding.length - 1;
    return(
        <SafeAreaView className="flex h-full items-center justify-between bg-white">
            <TouchableOpacity
            onPress={() => {
                router.replace("/(auth)/sign-up");
            }}
            className="w-full flex justify-end items-end p-5"
            >
                <Text className="text-black text-md font-JakartaBold">Skip</Text>
            </TouchableOpacity>
            <Swiper 
            ref={swiperRef}
            loop={false}
            dot={<View className="w-[32px] h-[4px] mx-1 bg-[#E2E8F0] rounded-full"/>}
            activeDot={<View className="w-[32px] h-[4px] mx-1 bg-[#0286FF] rounded-full"/>}
            onIndexChanged={(index) => setactiveIndex(index)}
            >
                {onboarding.map((item) => (
                    <View key={item.id} className="flex items-center justify-center p-5">
                        <Image 
                        source={item.image}
                        className="w-full h-[300px]"
                        resizeMode="contain"
                        />
                    <View className="flex flex-row items-center justify-center w-full mt-10">
                        <Text className="text-black text-3xl font-bold mx-10 text-center">{item.title}</Text>
                    </View>
                    <Text className="text-lg fonr-JakartaSemiBold text-center text-[#858585] mx-10 mt-3">{item.description}</Text>
                    </View>
                ))}
            </Swiper>

            <CustomButton 
            title={isLastSlide ? "Get Started" : "Next"}
            onPress={()=> isLastSlide 
                ? router.replace('/(auth)/sign-up') 
                : swiperRef.current?.scrollBy(1)} 
            className="w-11/12 mt-10" 
            />
        </SafeAreaView>
    );
};

export default Onboarding;


---
File: /app/(root)/(tabs)/_layout.tsx
---

import { icons } from "@/constants";
import { Tabs } from "expo-router";
import { Image, ImageSourcePropType, View } from "react-native";

const TabIcon = 
    ({ source, 
       focused 
    } : 
    {
        source: ImageSourcePropType, 
        focused: boolean;
}) => (
    <View 
    className={`flex flex-row justify-center items-center rounded-full ${focused ? "bg-general-300" : ""}`}
    >
        <View 
        className={`rounded-full w-12 h-12 items-center justify-center ${focused ? "bg-general-400" : ""}`}
        >
            <Image 
            source={source} 
            tintColor="white"
            resizeMode="contain"
            className="w-7 h-7"
            />
        </View>
    </View>
)

const Layout = () => (

    <Tabs 
    initialRouteName="index"
    screenOptions={{
        tabBarActiveTintColor: "white",
        tabBarInactiveTintColor: "white",
        tabBarShowLabel: false,
        tabBarStyle: {
            backgroundColor: "#333333",
            borderRadius: 50,
            paddingBottom: 0,
            overflow: "hidden",
            marginHorizontal: 20,
                marginBottom:20,
                height: 78,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                    flexDirection: "row",
                    position: "absolute",
        },
    }}
    >
        <Tabs.Screen 
            name="home"
            options={{
                title: "Home",
                headerShown: false,
                tabBarIcon: ({focused}) => 
                    <TabIcon focused={focused} source={icons.home} />   
            }}
        />
        <Tabs.Screen 
            name="rides"
            options={{
                title: "Rides",
                headerShown: false,
                tabBarIcon: ({focused}) => 
                    <TabIcon focused={focused} source={icons.list} />   
            }}
        />
        <Tabs.Screen 
            name="chat"
            options={{
                title: "Chat",
                headerShown: false,
                tabBarIcon: ({focused}) => 
                    <TabIcon focused={focused} source={icons.chat} />   
            }}
        />
        <Tabs.Screen 
            name="profile"
            options={{
                title: "Profile",
                headerShown: false,
                tabBarIcon: ({focused}) => 
                    <TabIcon focused={focused} source={icons.profile} />   
            }}
        />
    </Tabs>

)

export default Layout;


---
File: /app/(root)/(tabs)/chat.tsx
---

import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { images } from "@/constants";

const Chat = () => {
  return (
    <SafeAreaView className="flex-1 bg-white p-5">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Text className="text-2xl font-JakartaBold">Chat</Text>
        <View className="flex-1 h-fit flex justify-center items-center">
          <Image
            source={images.message}
            alt="message"
            className="w-full h-40"
            resizeMode="contain"
          />
          <Text className="text-3xl font-JakartaBold mt-3">
            No Messages Yet
          </Text>
          <Text className="text-base mt-2 text-center px-7">
            Start a conversation with your friends and family
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Chat;


---
File: /app/(root)/(tabs)/home.tsx
---

import { useUser } from "@clerk/clerk-expo";
import { useAuth } from "@clerk/clerk-expo";
import * as Location from "expo-location";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import GoogleTextInput from "@/components/GoogleTextInput";
import Map from "@/components/Map";
import RideCard from "@/components/RideCard";
import { icons, images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { Ride } from "@/types/type";

const Home = () => {
  const { user } = useUser();
  const { signOut } = useAuth();

  const { setUserLocation, setDestinationLocation } = useLocationStore();

  const handleSignOut = () => {
    signOut();
    router.replace("/(auth)/sign-in");
  };

  const [hasPermission, setHasPermission] = useState<boolean>(false);

  const {
    data: recentRides,
    loading,
    error,
  } = useFetch<Ride[]>(`/(api)/ride/${user?.id}`);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setHasPermission(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});

      const address = await Location.reverseGeocodeAsync({
        latitude: location.coords?.latitude!,
        longitude: location.coords?.longitude!,
      });

      setUserLocation({
        latitude: location.coords?.latitude,
        longitude: location.coords?.longitude,
        address: `${address[0].name}, ${address[0].region}`,
      });
    })();
  }, []);

  const handleDestinationPress = (location: {
    latitude: number;
    longitude: number;
    address: string;
  }) => {
    setDestinationLocation(location);

    router.push("/(root)/find-ride");
  };

  return (
    <SafeAreaView className="bg-general-500">
      <FlatList
        data={recentRides?.slice(0, 5)}
        renderItem={({ item }) => <RideCard ride={item} />}
        keyExtractor={(item, index) => index.toString()}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No recent rides found"
                  resizeMode="contain"
                />
                <Text className="text-sm">No recent rides found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <View className="flex flex-row items-center justify-between my-5">
              <Text className="text-2xl font-JakartaExtraBold">
                Welcome {user?.firstName}👋
              </Text>
              <TouchableOpacity
                onPress={handleSignOut}
                className="justify-center items-center w-10 h-10 rounded-full bg-white"
              >
                <Image source={icons.out} className="w-4 h-4" />
              </TouchableOpacity>
            </View>

            <GoogleTextInput
              icon={icons.search}
              containerStyle="bg-white shadow-md shadow-neutral-300"
              handlePress={handleDestinationPress}
            />

            <>
              <Text className="text-xl font-JakartaBold mt-5 mb-3">
                Your current location
              </Text>
              <View className="flex flex-row items-center bg-transparent h-[300px]">
                <Map />
              </View>
            </>

            <Text className="text-xl font-JakartaBold mt-5 mb-3">
              Recent Rides
            </Text>
          </>
        }
      />
    </SafeAreaView>
  );
};

export default Home;


---
File: /app/(root)/(tabs)/profile.tsx
---

import { useUser } from "@clerk/clerk-expo";
import { Image, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import InputField from "@/components/InputField";

const Profile = () => {
  const { user } = useUser();

  return (
    <SafeAreaView className="flex-1">
      <ScrollView
        className="px-5"
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        <Text className="text-2xl font-JakartaBold my-5">My profile</Text>

        <View className="flex items-center justify-center my-5">
          <Image
            source={{
              uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl,
            }}
            style={{ width: 110, height: 110, borderRadius: 110 / 2 }}
            className=" rounded-full h-[110px] w-[110px] border-[3px] border-white shadow-sm shadow-neutral-300"
          />
        </View>

        <View className="flex flex-col items-start justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 px-5 py-3">
          <View className="flex flex-col items-start justify-start w-full">
            <InputField
              label="First name"
              placeholder={user?.firstName || "Not Found"}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            />

            <InputField
              label="Last name"
              placeholder={user?.lastName || "Not Found"}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            />

            <InputField
              label="Email"
              placeholder={
                user?.primaryEmailAddress?.emailAddress || "Not Found"
              }
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            />

            <InputField
              label="Phone"
              placeholder={user?.primaryPhoneNumber?.phoneNumber || "Not Found"}
              containerStyle="w-full"
              inputStyle="p-3.5"
              editable={false}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default Profile;


---
File: /app/(root)/(tabs)/rides.tsx
---

import { useUser } from "@clerk/clerk-expo";
import { ActivityIndicator, FlatList, Image, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import RideCard from "@/components/RideCard";
import { images } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { Ride } from "@/types/type";

const Rides = () => {
  const { user } = useUser();

  const {
    data: recentRides,
    loading,
    error,
  } = useFetch<Ride[]>(`/(api)/ride/${user?.id}`);

  return (
    <SafeAreaView className="flex-1 bg-white">
      <FlatList
        data={recentRides}
        renderItem={({ item }) => <RideCard ride={item} />}
        keyExtractor={(item, index) => index.toString()}
        className="px-5"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{
          paddingBottom: 100,
        }}
        ListEmptyComponent={() => (
          <View className="flex flex-col items-center justify-center">
            {!loading ? (
              <>
                <Image
                  source={images.noResult}
                  className="w-40 h-40"
                  alt="No recent rides found"
                  resizeMode="contain"
                />
                <Text className="text-sm">No recent rides found</Text>
              </>
            ) : (
              <ActivityIndicator size="small" color="#000" />
            )}
          </View>
        )}
        ListHeaderComponent={
          <>
            <Text className="text-2xl font-JakartaBold my-5">All Rides</Text>
          </>
        }
      />
    </SafeAreaView>
  );
};

export default Rides;


---
File: /app/(root)/_layout.tsx
---

import { Stack } from "expo-router";

const Layout = () => {
  return (
    <Stack>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="find-ride" options={{ headerShown: false }} />
      <Stack.Screen name="confirm-ride" options={{ headerShown: false }} />
      <Stack.Screen name="book-ride" options={{ headerShown: false }} />
    </Stack>
  );
};

export default Layout;


---
File: /app/(root)/book-ride.tsx
---

import { useUser } from "@clerk/clerk-expo";
import { StripeProvider } from "@stripe/stripe-react-native";
import { Image, Text, View } from "react-native";

import Payment from "@/components/Payment";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { formatTime } from "@/lib/utils";
import { useDriverStore, useLocationStore } from "@/store";

const BookRide = () => {
  const { user } = useUser();
  const { userAddress, destinationAddress } = useLocationStore();
  const { drivers, selectedDriver } = useDriverStore();

  const driverDetails = drivers?.filter(
    (driver) => +driver.id === selectedDriver,
  )[0];

  return (
    <StripeProvider
      publishableKey={process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY!}
      merchantIdentifier="merchant.com.uber"
      urlScheme="myapp"
    >
      <RideLayout title="Book Ride">
        <>
          <Text className="text-xl font-JakartaSemiBold mb-3">
            Ride Information
          </Text>

          <View className="flex flex-col w-full items-center justify-center mt-10">
            <Image
              source={{ uri: driverDetails?.profile_image_url }}
              className="w-28 h-28 rounded-full"
            />

            <View className="flex flex-row items-center justify-center mt-5 space-x-2">
              <Text className="text-lg font-JakartaSemiBold">
                {driverDetails?.title}
              </Text>

              <View className="flex flex-row items-center space-x-0.5">
                <Image
                  source={icons.star}
                  className="w-5 h-5"
                  resizeMode="contain"
                />
                <Text className="text-lg font-JakartaRegular">
                  {driverDetails?.rating}
                </Text>
              </View>
            </View>
          </View>

          <View className="flex flex-col w-full items-start justify-center py-3 px-5 rounded-3xl bg-general-600 mt-5">
            <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
              <Text className="text-lg font-JakartaRegular">Ride Price</Text>
              <Text className="text-lg font-JakartaRegular text-[#0CC25F]">
                ${driverDetails?.price}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between w-full border-b border-white py-3">
              <Text className="text-lg font-JakartaRegular">Pickup Time</Text>
              <Text className="text-lg font-JakartaRegular">
                {formatTime(parseInt(`${driverDetails.time}`) || 5)}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-between w-full py-3">
              <Text className="text-lg font-JakartaRegular">Car Seats</Text>
              <Text className="text-lg font-JakartaRegular">
                {driverDetails?.car_seats}
              </Text>
            </View>
          </View>

          <View className="flex flex-col w-full items-start justify-center mt-5">
            <View className="flex flex-row items-center justify-start mt-3 border-t border-b border-general-700 w-full py-3">
              <Image source={icons.to} className="w-6 h-6" />
              <Text className="text-lg font-JakartaRegular ml-2">
                {userAddress}
              </Text>
            </View>

            <View className="flex flex-row items-center justify-start border-b border-general-700 w-full py-3">
              <Image source={icons.point} className="w-6 h-6" />
              <Text className="text-lg font-JakartaRegular ml-2">
                {destinationAddress}
              </Text>
            </View>
          </View>

          <Payment
            fullName={user?.fullName!}
            email={user?.emailAddresses[0].emailAddress!}
            amount={driverDetails?.price!}
            driverId={driverDetails?.id}
            rideTime={driverDetails?.time!}
          />
        </>
      </RideLayout>
    </StripeProvider>
  );
};

export default BookRide;


---
File: /app/(root)/confirm-ride.tsx
---

import CustomButton from "@/components/CustomButton";
import DriverCard from "@/components/DriverCard";
import RideLayout from "@/components/RideLayout";
import { useDriverStore } from "@/store";
import { router } from "expo-router";
import { FlatList, Text, View } from "react-native";

const drivers = [
  {
    id: "1",
    first_name: "James",
    last_name: "Wilson",
    profile_image_url:
      "https://ucarecdn.com/dae59f69-2c1f-48c3-a883-017bcf0f9950/-/preview/1000x666/",
    car_image_url:
      "https://ucarecdn.com/a2dc52b2-8bf7-4e49-9a36-3ffb5229ed02/-/preview/465x466/",
    car_seats: 4,
    rating: "4.80",
  },
  {
    id: "2",
    first_name: "David",
    last_name: "Brown",
    profile_image_url:
      "https://ucarecdn.com/6ea6d83d-ef1a-483f-9106-837a3a5b3f67/-/preview/1000x666/",
    car_image_url:
      "https://ucarecdn.com/a3872f80-c094-409c-82f8-c9ff38429327/-/preview/930x932/",
    car_seats: 5,
    rating: "4.60",
  },
  {
    id: "3",
    first_name: "Michael",
    last_name: "Johnson",
    profile_image_url:
      "https://ucarecdn.com/0330d85c-232e-4c30-bd04-e5e4d0e3d688/-/preview/826x822/",
    car_image_url:
      "https://ucarecdn.com/289764fb-55b6-4427-b1d1-f655987b4a14/-/preview/930x932/",
    car_seats: 4,
    rating: "4.70",
  },
  {
    id: "4",
    first_name: "Robert",
    last_name: "Green",
    profile_image_url:
      "https://ucarecdn.com/fdfc54df-9d24-40f7-b7d3-6f391561c0db/-/preview/626x417/",
    car_image_url:
      "https://ucarecdn.com/b6fb3b55-7676-4ff3-8484-fb115e268d32/-/preview/930x932/",
    car_seats: 4,
    rating: "4.90",
  },
];

const ConfirmRide = () => {
  const { drivers, selectedDriver, setSelectedDriver } = useDriverStore();

  return (
    <RideLayout title="Choose a driver" snapPoints={["65%", "85%"]}>
      <FlatList
        data={drivers}
        renderItem={({ item }) => (
          <DriverCard
            selected={selectedDriver!}
            setSelected={() => setSelectedDriver(Number(item.id)!)}
            item={item}
          />
        )}
        ListFooterComponent={() => (
          <View className="mx-5 mt-10">
            <CustomButton
              title="Select Ride"
              onPress={() => router.push("/(root)/book-ride")}
            />
          </View>
        )}
      />
    </RideLayout>
  );
};

export default ConfirmRide;



---
File: /app/(root)/find-ride.tsx
---

import CustomButton from "@/components/CustomButton";
import GoogleTextInput from "@/components/GoogleTextInput";
import RideLayout from "@/components/RideLayout";
import { icons } from "@/constants";
import { useLocationStore } from "@/store";
import { router } from "expo-router";
import { Text, View } from "react-native";

const FindRide = () => {
  const {
    userAddress,
    destinationAddress,
    setDestinationLocation,
    setUserLocation,
  } = useLocationStore();

  return (
    <RideLayout title="Ride" snapPoints={["85%"]} >
      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">From</Text>
        <GoogleTextInput
          icon={icons.target}
          initialLocation={userAddress}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="#f5f5f5"
          handlePress={(location) => setUserLocation(location)}
        />
      </View>

      <View className="my-3">
        <Text className="text-lg font-JakartaSemiBold mb-3">To</Text>
        <GoogleTextInput
          icon={icons.target}
          initialLocation={destinationAddress}
          containerStyle="bg-neutral-100"
          textInputBackgroundColor="transparent"
          handlePress={(location) => setDestinationLocation(location)}
        />
      </View>

      <CustomButton
        title="Find Now"
        onPress={() => router.push("/(root)/confirm-ride")}
      />
    </RideLayout>
  );
};

export default FindRide;



---
File: /app/_layout.tsx
---

import 'react-native-reanimated';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { LogBox } from 'react-native';
import { tokenCache } from '@/lib/auth';
import * as SplashScreen from 'expo-splash-screen';
import { ClerkProvider, ClerkLoaded } from '@clerk/clerk-expo'


const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY!;

SplashScreen.preventAutoHideAsync();

LogBox.ignoreLogs(["Clerk:"]);

export default function RootLayout() {
  const [loaded] = useFonts({
    "Jakarta-Bold": require("../assets/fonts/PlusJakartaSans-Bold.ttf"),
    "Jakarta-ExtraBold": require("../assets/fonts/PlusJakartaSans-ExtraBold.ttf"),
    "Jakarta-ExtraLight": require("../assets/fonts/PlusJakartaSans-ExtraLight.ttf"),
    "Jakarta-Light": require("../assets/fonts/PlusJakartaSans-Light.ttf"),
    "Jakarta-Medium": require("../assets/fonts/PlusJakartaSans-Medium.ttf"),
    "Jakarta-Regular": require("../assets/fonts/PlusJakartaSans-Regular.ttf"),
    "Jakarta-SemiBold": require("../assets/fonts/PlusJakartaSans-SemiBold.ttf"),
});

if (!publishableKey) {
  throw new Error(
    'Missing Publishable Key. Please set EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY in your .env',
  );
}

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <ClerkProvider publishableKey={publishableKey} tokenCache={tokenCache}>
      <ClerkLoaded>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(auth)" options={{ headerShown: false }} />
        <Stack.Screen name="(root)" options={{ headerShown: false }} />
        <Stack.Screen name="+not-found" />
      </Stack>
        </ClerkLoaded>
      </ClerkProvider>
      );
}



---
File: /app/+html.tsx
---

import { ScrollViewStyleReset } from 'expo-router/html';
import { type PropsWithChildren } from 'react';

/**
 * This file is web-only and used to configure the root HTML for every web page during static rendering.
 * The contents of this function only run in Node.js environments and do not have access to the DOM or browser APIs.
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />

        {/*
          Disable body scrolling on web. This makes ScrollView components work closer to how they do on native.
          However, body scrolling is often nice to have for mobile web. If you want to enable it, remove this line.
        */}
        <ScrollViewStyleReset />

        {/* Using raw CSS styles as an escape-hatch to ensure the background color never flickers in dark-mode. */}
        <style dangerouslySetInnerHTML={{ __html: responsiveBackground }} />
        {/* Add any additional <head> elements that you want globally available on web... */}
      </head>
      <body>{children}</body>
    </html>
  );
}

const responsiveBackground = `
body {
  background-color: #fff;
}
@media (prefers-color-scheme: dark) {
  body {
    background-color: #000;
  }
}`;



---
File: /app/+not-found.tsx
---

import { Link, Stack } from 'expo-router';
import { StyleSheet, View, Text } from 'react-native';



export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={styles.container}>
        <Text type="title">This screen doesn't exist.</Text>
        <Link href="/" style={styles.link}>
          <Text type="link">Go to home screen!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});



---
File: /app/index.tsx
---

import { Redirect } from "expo-router";
import { useAuth } from '@clerk/clerk-expo'



const Home = ()  => {
    const { isSignedIn } = useAuth();

  if (isSignedIn) {
    return <Redirect href="/(root)/(tabs)/home" />;
  }

    return <Redirect href="/(auth)/welcome" />
};

export default Home;


---
File: /components/CustomButton.tsx
---

import { ButtonProps } from "@/types/type";
import { Text, TouchableOpacity } from "react-native";

const getBgVariantStyle = (variant: ButtonProps['bgVariant']) => {
    switch (variant) {
        case "secondary":
            return  "bg-grey-500";
        case "danger":
            return  "bg-red-500";
        case "success":
            return  "bg-green-500";
        case "outline":
            return  "bg-transparent border-neutral-300 border-[0.5px]";
        default: 
            return  "bg-[#0286ff]";
    }
}
const getTextVariantStyle = (variant: ButtonProps['textVariant']) => {
    switch (variant) {
        case "primary":
            return  "text-black";
        case "secondary":
            return  "text-grey-100";
        case "danger":
            return  "bg-red-100";
        case "success":
            return  "bg-green-100";
        default: 
            return  "text-white";
    }
}

const CustomButton = ({ onPress, title, bgVariant="primary", textVariant="default", IconLeft, IconRight, className, ...props} : ButtonProps) => (
    <TouchableOpacity onPress={onPress} className={`w-full rounded-full p-3 flex flex-row justify-center items-center shadow-md shadow-neutral-400/70 ${getBgVariantStyle(bgVariant)} ${className}`}{...props}>
        {IconLeft && <IconLeft />}   
        <Text className={`text-lg font-bold ${getTextVariantStyle(textVariant)}`}>{title}</Text>
        {IconRight && <IconRight />}
    </TouchableOpacity>
);

export default CustomButton;


---
File: /components/DriverCard.tsx
---

import React from "react";
import {Image, Text, TouchableOpacity, View} from "react-native";

import {icons} from "@/constants";
import {formatTime} from "@/lib/utils";
import {DriverCardProps} from "@/types/type";

const DriverCard = ({item, selected, setSelected}: DriverCardProps) => {
    return (
        <TouchableOpacity
            onPress={setSelected}
            className={`${
                selected === item.id ? "bg-general-600" : "bg-white"
            } flex flex-row items-center justify-between py-5 px-3 rounded-xl`}
        >
            <Image
                source={{uri: item.profile_image_url}}
                className="w-14 h-14 rounded-full"
            />

            <View className="flex-1 flex flex-col items-start justify-center mx-3">
                <View className="flex flex-row items-center justify-start mb-1">
                    <Text className="text-lg font-JakartaRegular">{item.title}</Text>

                    <View className="flex flex-row items-center space-x-1 ml-2">
                        <Image source={icons.star} className="w-3.5 h-3.5"/>
                        <Text className="text-sm font-JakartaRegular">4</Text>
                    </View>
                </View>

                <View className="flex flex-row items-center justify-start">
                    <View className="flex flex-row items-center">
                        <Image source={icons.dollar} className="w-4 h-4"/>
                        <Text className="text-sm font-JakartaRegular ml-1">
                            ${item.price}
                        </Text>
                    </View>

                    <Text className="text-sm font-JakartaRegular text-general-800 mx-1">
                        |
                    </Text>

                    <Text className="text-sm font-JakartaRegular text-general-800">
                        {formatTime(parseInt(`${item.time}`) || 5)}
                    </Text>

                    <Text className="text-sm font-JakartaRegular text-general-800 mx-1">
                        |
                    </Text>

                    <Text className="text-sm font-JakartaRegular text-general-800">
                        {item.car_seats} seats
                    </Text>
                </View>
            </View>

            <Image
                source={{uri: item.car_image_url}}
                className="h-14 w-14"
                resizeMode="contain"
            />
        </TouchableOpacity>
    );
};

export default DriverCard;


---
File: /components/GoogleTextInput.tsx
---

import { View, Image } from "react-native";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";

import { icons } from "@/constants";
import { GoogleInputProps } from "@/types/type";

const googlePlacesApiKey = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

const GoogleTextInput = ({
  icon,
  initialLocation,
  containerStyle,
  textInputBackgroundColor,
  handlePress,
}: GoogleInputProps) => {
  return (
    <View
      className={`flex flex-row items-center justify-center relative z-50 rounded-xl ${containerStyle}`}
    >
      <GooglePlacesAutocomplete
        fetchDetails={true}
        placeholder="Search"
        debounce={200}
        styles={{
          textInputContainer: {
            alignItems: "center",
            justifyContent: "center",
            borderRadius: 20,
            marginHorizontal: 20,
            position: "relative",
            shadowColor: "#d4d4d4",
          },
          textInput: {
            backgroundColor: textInputBackgroundColor
              ? textInputBackgroundColor
              : "white",
            fontSize: 16,
            fontWeight: "600",
            marginTop: 5,
            width: "100%",
            borderRadius: 200,
          },
          listView: {
            backgroundColor: textInputBackgroundColor
              ? textInputBackgroundColor
              : "white",
            position: "relative",
            top: 0,
            width: "100%",
            borderRadius: 10,
            shadowColor: "#d4d4d4",
            zIndex: 99,
          },
        }}
        onPress={(data, details = null) => {
          handlePress({
            latitude: details?.geometry.location.lat!,
            longitude: details?.geometry.location.lng!,
            address: data.description,
          });
        }}
        query={{
          key: googlePlacesApiKey,
          language: "en",
        }}
        renderLeftButton={() => (
          <View className="justify-center items-center w-6 h-6">
            <Image
              source={icon ? icon : icons.search}
              className="w-6 h-6"
              resizeMode="contain"
            />
          </View>
        )}
        textInputProps={{
          placeholderTextColor: "gray",
          placeholder: initialLocation ?? "Where the fuck you wanna go?",
        }}
      />
    </View>
  );
};

export default GoogleTextInput;


---
File: /components/InputField.tsx
---

import { InputFieldProps } from "@/types/type";
import {
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const InputField = ({
  label,
  labelStyle,
  icon,
  secureTextEntry,
  containerStyle,
  inputStyle,
  iconStyle,
  className,
  ...props
}: InputFieldProps) => (
  <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View className="my-2 w-full">
        <Text className={`text-lg font-JakartaSemiBold mb-3 ${labelStyle}`}>
          {label}
        </Text>
        <View
          className={`flex flex-row justify-start items-center relative bg-neutral-100 rounded-full border border-neutral-100 focus:border-primary-500 ${containerStyle}`}
        >
          {icon && (
            <Image source={icon} className={`w-6 h-6 ml-4 ${iconStyle}`} />
          )}
          <TextInput
            className={`rounded-full p-4 font-JakartaSemiBold text-[15px] flex-1 ${inputStyle} text-left`}
            secureTextEntry={secureTextEntry}
            {...props}
          />
        </View>
      </View>
    </TouchableWithoutFeedback>
  </KeyboardAvoidingView>
);

export default InputField;



---
File: /components/Map.tsx
---

import { icons } from "@/constants";
import { useFetch } from "@/lib/fetch";
import { calculateDriverTimes, calculateRegion, generateMarkersFromData } from "@/lib/map";
import { useDriverStore, useLocationStore } from "@/store";
import { Driver, MarkerData } from "@/types/type";
import { useEffect, useState } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import MapViewDirections from "react-native-maps-directions";


const Map = () => {
    const { data: drivers, loading, error } = useFetch<Driver[]>("/(api)/driver")
     const { 
        userLongitude, 
        userLatitude, 
        destinationLongitude, 
        destinationLatitude, 
        } = useLocationStore();
        const { selectedDriver, setDrivers } = useDriverStore();
        const [ markers, setMarkers ] = useState<MarkerData[]>([])

    const region = calculateRegion({
        userLatitude,
        userLongitude,
        destinationLatitude,
        destinationLongitude,
    });

    useEffect(() => {
        
        if(Array.isArray(drivers)) {
            if( !userLatitude || !userLongitude ) return;

            const newMarkers = generateMarkersFromData({
                data: drivers,
                userLatitude,
                userLongitude,
            });

            setMarkers(newMarkers)
        }
    }, [drivers, userLatitude, userLongitude]) 

    useEffect (() => {
        if (markers.length > 0 && destinationLatitude  && destinationLongitude ) 
            {
            calculateDriverTimes({
                markers, 
                userLatitude,
                userLongitude,
                destinationLatitude,
                destinationLongitude
            }).then((driver) => {
                setDrivers(driver as MarkerData[]);
            });
        }
    }, [markers, destinationLatitude, destinationLongitude]);

    if (loading || !userLatitude || !userLongitude){
        return (
            <View className="flex justify-between items-center w-full" >
                <ActivityIndicator size="small" color="#000" />
            </View>
            )
        }

        if(error) {
            return (
            <View className="flex justify-between items-center w-full" >
                <Text>Error: {error}</Text>
            </View>
            )
        }

    return (
    <MapView
        provider={PROVIDER_DEFAULT}
        className="w-full h-full rounded-2xl"
        tintColor="black"
        mapType="mutedStandard"
        showsPointsOfInterest={false}
        initialRegion={region}
        showsUserLocation={true}
        userInterfaceStyle="light"
    >
        {markers.map((marker) => (
            <Marker 
                key={marker.id}
                coordinate={{
                    latitude: marker.latitude,
                    longitude: marker.longitude,
                }}
                title={marker.title}
                image={
                    selectedDriver === marker.id ? icons.selectedMarker : icons.marker
                }
            />
        ))}

        {destinationLatitude && destinationLongitude && (
            <>
            <Marker 
                key="destination"
                coordinate={{
                    latitude: destinationLatitude,
                    longitude: destinationLongitude
                }}
                title="Destination"
                image={icons.pin}
                />

                <MapViewDirections 
                    origin={{
                        latitude: userLatitude!,
                        longitude: userLongitude!,
                    }}
                    destination={{
                        latitude: destinationLatitude,
                        longitude: destinationLongitude
                    }}
                    apikey={process.env.EXPO_PUBLIC_GOOGLE_API_KEY}
                    strokeColor="#0286ff"
                    strokeWidth={3}
                />
            </>
        )}
    </MapView>
    )
}

export default Map;


---
File: /components/OAuth.tsx
---

import { useOAuth } from "@clerk/clerk-expo";
import { router } from "expo-router";
import { Alert, Image, Text, View } from "react-native";

import CustomButton from "@/components/CustomButton";
import { icons } from "@/constants";
import { googleOAuth } from "@/lib/auth";

const OAuth = () => {
  const { startOAuthFlow } = useOAuth({ strategy: "oauth_google" });

  const handleGoogleSignIn = async () => {
    const result = await googleOAuth(startOAuthFlow);

    if (result.code === "session_exists") {
      Alert.alert("Success", "Session exists. Redirecting to home screen.");
      router.replace("/(root)/(tabs)/home");
    }

    Alert.alert(result.success ? "Success" : "Error", result.message);
  };

  return (
    <View>
      <View className="flex flex-row justify-center items-center mt-4 gap-x-3">
        <View className="flex-1 h-[1px] bg-general-100" />
        <Text className="text-lg">Or</Text>
        <View className="flex-1 h-[1px] bg-general-100" />
      </View>

      <CustomButton
        title="Log In with Google"
        className="mt-5 w-full shadow-none"
        IconLeft={() => (
          <Image
            source={icons.google}
            resizeMode="contain"
            className="w-5 h-5 mx-2"
          />
        )}
        bgVariant="outline"
        textVariant="primary"
        onPress={handleGoogleSignIn}
      />
    </View>
  );
};

export default OAuth;


---
File: /components/Payment.tsx
---

import { useAuth } from "@clerk/clerk-expo";
import { useStripe } from "@stripe/stripe-react-native";
import { router } from "expo-router";
import React, { useState } from "react";
import { Alert, Image, Text, View } from "react-native";
import { ReactNativeModal } from "react-native-modal";

import CustomButton from "@/components/CustomButton";
import { images } from "@/constants";
import { fetchAPI } from "@/lib/fetch";
import { useLocationStore } from "@/store";
import { PaymentProps } from "@/types/type";

const Payment = ({
  fullName,
  email,
  amount,
  driverId,
  rideTime,
}: PaymentProps) => {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const {
    userAddress,
    userLongitude,
    userLatitude,
    destinationLatitude,
    destinationAddress,
    destinationLongitude,
  } = useLocationStore();

  const { userId } = useAuth();
  const [success, setSuccess] = useState<boolean>(false);

  const openPaymentSheet = async () => {
    await initializePaymentSheet();

    const { error } = await presentPaymentSheet();

    if (error) {
      Alert.alert(`Error code: ${error.code}`, error.message);
    } else {
      setSuccess(true);
    }
  };

  const initializePaymentSheet = async () => {
    const { error } = await initPaymentSheet({
      merchantDisplayName: "Ryde, Inc.",
      intentConfiguration: {
        mode: {
          amount: parseInt(amount) * 100,
          currencyCode: "USD",
        },
        confirmHandler: async (
          paymentMethod,
          shouldSavePaymentMethod,
          intentCreationCallback,
        ) => {
          const { paymentIntent, customer } = await fetchAPI(
            "/(api)/(stripe)/create",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                name: fullName || email.split("@")[0],
                email: email,
                amount: amount,
                paymentMethodId: paymentMethod.id,
              }),
            },
          );

          if (paymentIntent.client_secret) {
            const { result } = await fetchAPI("/(api)/(stripe)/pay", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                payment_method_id: paymentMethod.id,
                payment_intent_id: paymentIntent.id,
                customer_id: customer,
                client_secret: paymentIntent.client_secret,
              }),
            });

            if (result.client_secret) {
              await fetchAPI("/(api)/ride/create", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  origin_address: userAddress,
                  destination_address: destinationAddress,
                  origin_latitude: userLatitude,
                  origin_longitude: userLongitude,
                  destination_latitude: destinationLatitude,
                  destination_longitude: destinationLongitude,
                  ride_time: rideTime.toFixed(0),
                  fare_price: parseInt(amount) * 100,
                  payment_status: "paid",
                  driver_id: driverId,
                  user_id: userId,
                }),
              });

              intentCreationCallback({
                clientSecret: result.client_secret,
              });
            }
          }
        },
      },
      returnURL: "myapp://book-ride",
    });

    if (!error) {
      // setLoading(true);
    }
  };

  return (
    <>
      <CustomButton
        title="Confirm Ride"
        className="my-10"
        onPress={openPaymentSheet}
      />

      <ReactNativeModal
        isVisible={success}
        onBackdropPress={() => setSuccess(false)}
      >
        <View className="flex flex-col items-center justify-center bg-white p-7 rounded-2xl">
          <Image source={images.check} className="w-28 h-28 mt-5" />

          <Text className="text-2xl text-center font-JakartaBold mt-5">
            Booking placed successfully
          </Text>

          <Text className="text-md text-general-200 font-JakartaRegular text-center mt-3">
            Thank you for your booking. Your reservation has been successfully
            placed. Please proceed with your trip.
          </Text>

          <CustomButton
            title="Back Home"
            onPress={() => {
              setSuccess(false);
              router.push("/(root)/(tabs)/home");
            }}
            className="mt-5"
          />
        </View>
      </ReactNativeModal>
    </>
  );
};

export default Payment;


---
File: /components/RideCard.tsx
---

import { Image, Text, View } from "react-native";

import { icons } from "@/constants";
import { formatDate, formatTime } from "@/lib/utils";
import { Ride } from "@/types/type";

const RideCard = ({ ride }: { ride: Ride }) => {
  return (
    <View className="flex flex-row items-center justify-center bg-white rounded-lg shadow-sm shadow-neutral-300 mb-3">
      <View className="flex flex-col items-start justify-center p-3">
        <View className="flex flex-row items-center justify-between">
          <Image
            source={{
              uri: `https://maps.geoapify.com/v1/staticmap?style=osm-bright&width=600&height=400&center=lonlat:${ride.destination_longitude},${ride.destination_latitude}&zoom=14&apiKey=${process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY}`,
            }}
            className="w-[80px] h-[90px] rounded-lg"
          />

          <View className="flex flex-col mx-5 gap-y-5 flex-1">
            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.to} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {ride.origin_address}
              </Text>
            </View>

            <View className="flex flex-row items-center gap-x-2">
              <Image source={icons.point} className="w-5 h-5" />
              <Text className="text-md font-JakartaMedium" numberOfLines={1}>
                {ride.destination_address}
              </Text>
            </View>
          </View>
        </View>

        <View className="flex flex-col w-full mt-5 bg-general-500 rounded-lg p-3 items-start justify-center">
          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Date & Time
            </Text>
            <Text className="text-md font-JakartaBold" numberOfLines={1}>
              {formatDate(ride.created_at)}, {formatTime(ride.ride_time)}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Driver
            </Text>
            <Text className="text-md font-JakartaBold">
              {ride.driver.first_name} {ride.driver.last_name}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between mb-5">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Car Seats
            </Text>
            <Text className="text-md font-JakartaBold">
              {ride.driver.car_seats}
            </Text>
          </View>

          <View className="flex flex-row items-center w-full justify-between">
            <Text className="text-md font-JakartaMedium text-gray-500">
              Payment Status
            </Text>
            <Text
              className={`text-md capitalize font-JakartaBold ${ride.payment_status === "paid" ? "text-green-500" : "text-red-500"}`}
            >
              {ride.payment_status}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
};

export default RideCard;



---
File: /components/RideLayout.tsx
---

import { icons } from "@/constants";
import { router } from "expo-router";
import { Image, Text, TouchableOpacity, View } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import Map from "@/components/Map";
import BottomSheet, { BottomSheetView } from "@gorhom/bottom-sheet";
import { useRef } from "react";

const RideLayout = ({
  title,
  children,
  snapPoints,
}: {
  title: string;
  children: React.ReactNode;
  snapPoints?: string[];
}) => {
  const bottomsheetRef = useRef<BottomSheet>(null);

  return (
    <GestureHandlerRootView>
      <View className="flex-1 bg-white">
        <View className="flex flex-col h-screen bg-blue-500">
          <View className="flex flex-row absolute z-10 top-16 items-center justify-start px-5">
            <TouchableOpacity onPress={() => router.back()}>
              <View className="w-10 h-10 bg-white rounded-full items-center justify-center">
                <Image
                  source={icons.backArrow}
                  resizeMode="contain"
                  className="w-6 h-6"
                />
              </View>
            </TouchableOpacity>
            <Text className="text-xl font-JakartaSemiBold ml-5">
              {title || "Go Back"}
            </Text>
          </View>
          <Map />
        </View>
        <BottomSheet 
          keyboardBehavior="extend"
          ref={bottomsheetRef} 
          snapPoints={snapPoints || ["40%", "85%"]} 
          index={0}
           >
            <BottomSheetView 
              style={{ flex: 1, padding: 20 }} >
              {children}
            </BottomSheetView>
            </BottomSheet>
      </View>
    </GestureHandlerRootView>
  );
};

export default RideLayout;



---
File: /constants/index.ts
---

import arrowDown from "@/assets/icons/arrow-down.png";
import arrowUp from "@/assets/icons/arrow-up.png";
import backArrow from "@/assets/icons/back-arrow.png";
import chat from "@/assets/icons/chat.png";
import checkmark from "@/assets/icons/check.png";
import close from "@/assets/icons/close.png";
import dollar from "@/assets/icons/dollar.png";
import email from "@/assets/icons/email.png";
import eyecross from "@/assets/icons/eyecross.png";
import google from "@/assets/icons/google.png";
import home from "@/assets/icons/home.png";
import list from "@/assets/icons/list.png";
import lock from "@/assets/icons/lock.png";
import map from "@/assets/icons/map.png";
import marker from "@/assets/icons/marker.png";
import out from "@/assets/icons/out.png";
import person from "@/assets/icons/person.png";
import pin from "@/assets/icons/pin.png";
import point from "@/assets/icons/point.png";
import profile from "@/assets/icons/profile.png";
import search from "@/assets/icons/search.png";
import selectedMarker from "@/assets/icons/selected-marker.png";
import star from "@/assets/icons/star.png";
import target from "@/assets/icons/target.png";
import to from "@/assets/icons/to.png";
import check from "@/assets/images/check.png";
import getStarted from "@/assets/images/get-started.png";
import message from "@/assets/images/message.png";
import noResult from "@/assets/images/no-result.png";
import onboarding1 from "@/assets/images/onboarding1.png";
import onboarding2 from "@/assets/images/onboarding2.png";
import onboarding3 from "@/assets/images/onboarding3.png";
import signUpCar from "@/assets/images/signup-car.png";

export const images = {
    onboarding1,
    onboarding2,
    onboarding3,
    getStarted,
    signUpCar,
    check,
    noResult,
    message,
};

export const icons = {
    arrowDown,
    arrowUp,
    backArrow,
    chat,
    checkmark,
    close,
    dollar,
    email,
    eyecross,
    google,
    home,
    list,
    lock,
    map,
    marker,
    out,
    person,
    pin,
    point,
    profile,
    search,
    selectedMarker,
    star,
    target,
    to,
};

export const onboarding = [
    {
        id: 1,
        title: "The perfect ride is just a tap away!",
        description:
            "Your journey begins with Ryde. Find your ideal ride effortlessly.",
        image: images.onboarding1,
    },
    {
        id: 2,
        title: "Best car in your hands with Ryde",
        description:
            "Discover the convenience of finding your perfect ride with Ryde",
        image: images.onboarding2,
    },
    {
        id: 3,
        title: "Your ride, your way. Let's go!",
        description:
            "Enter your destination, sit back, and let us take care of the rest.",
        image: images.onboarding3,
    },
];

export const data = {
    onboarding,
};


---
File: /lib/auth.ts
---

import * as Linking from "expo-linking";
import * as SecureStore from "expo-secure-store";

import { fetchAPI } from "@/lib/fetch";

export const tokenCache = {
  async getToken(key: string) {
    try {
      const item = await SecureStore.getItemAsync(key);
      if (item) {
        console.log(`${key} was used 🔐 \n`);
      } else {
        console.log("No values stored under key: " + key);
      }
      return item;
    } catch (error) {
      console.error("SecureStore get item error: ", error);
      await SecureStore.deleteItemAsync(key);
      return null;
    }
  },
  async saveToken(key: string, value: string) {
    try {
      return SecureStore.setItemAsync(key, value);
    } catch (err) {
      return;
    }
  },
};

export const googleOAuth = async (startOAuthFlow: any) => {
  try {
    const { createdSessionId, setActive, signUp } = await startOAuthFlow({
      redirectUrl: Linking.createURL("/(root)/(tabs)/home"),
    });

    if (createdSessionId) {
      if (setActive) {
        await setActive({ session: createdSessionId });

        if (signUp.createdUserId) {
          await fetchAPI("/(api)/user", {
            method: "POST",
            body: JSON.stringify({
              name: `${signUp.firstName} ${signUp.lastName}`,
              email: signUp.emailAddress,
              clerkId: signUp.createdUserId,
            }),
          });
        }

        return {
          success: true,
          code: "success",
          message: "You have successfully signed in with Google",
        };
      }
    }

    return {
      success: false,
      message: "An error occurred while signing in with Google",
    };
  } catch (err: any) {
    console.error(err);
    return {
      success: false,
      code: err.code,
      message: err?.errors[0]?.longMessage,
    };
  }
};


---
File: /lib/fetch.ts
---

import {useState, useEffect, useCallback} from "react";

export const fetchAPI = async (url: string, options?: RequestInit) => {
    try {
        const response = await fetch(url, options);
        if (!response.ok) {
            new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error("Fetch error:", error);
        throw error;
    }
};

export const useFetch = <T>(url: string, options?: RequestInit) => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const result = await fetchAPI(url, options);
            setData(result.data);
        } catch (err) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }, [url, options]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return {data, loading, error, refetch: fetchData};
};


---
File: /lib/map.ts
---

import {Driver, MarkerData} from "@/types/type";

const directionsAPI = process.env.EXPO_PUBLIC_GOOGLE_API_KEY;

export const generateMarkersFromData = ({
                                            data,
                                            userLatitude,
                                            userLongitude,
                                        }: {
    data: Driver[];
    userLatitude: number;
    userLongitude: number;
}): MarkerData[] => {
    return data.map((driver) => {
        const latOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005
        const lngOffset = (Math.random() - 0.5) * 0.01; // Random offset between -0.005 and 0.005

        return {
            latitude: userLatitude + latOffset,
            longitude: userLongitude + lngOffset,
            title: `${driver.first_name} ${driver.last_name}`,
            ...driver,
        };
    });
};

export const calculateRegion = ({
                                    userLatitude,
                                    userLongitude,
                                    destinationLatitude,
                                    destinationLongitude,
                                }: {
    userLatitude: number | null;
    userLongitude: number | null;
    destinationLatitude?: number | null;
    destinationLongitude?: number | null;
}) => {
    if (!userLatitude || !userLongitude) {
        return {
            latitude: 37.78825,
            longitude: -122.4324,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };
    }

    if (!destinationLatitude || !destinationLongitude) {
        return {
            latitude: userLatitude,
            longitude: userLongitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
        };
    }

    const minLat = Math.min(userLatitude, destinationLatitude);
    const maxLat = Math.max(userLatitude, destinationLatitude);
    const minLng = Math.min(userLongitude, destinationLongitude);
    const maxLng = Math.max(userLongitude, destinationLongitude);

    const latitudeDelta = (maxLat - minLat) * 1.3; // Adding some padding
    const longitudeDelta = (maxLng - minLng) * 1.3; // Adding some padding

    const latitude = (userLatitude + destinationLatitude) / 2;
    const longitude = (userLongitude + destinationLongitude) / 2;

    return {
        latitude,
        longitude,
        latitudeDelta,
        longitudeDelta,
    };
};

export const calculateDriverTimes = async ({
                                               markers,
                                               userLatitude,
                                               userLongitude,
                                               destinationLatitude,
                                               destinationLongitude,
                                           }: {
    markers: MarkerData[];
    userLatitude: number | null;
    userLongitude: number | null;
    destinationLatitude: number | null;
    destinationLongitude: number | null;
}) => {
    if (
        !userLatitude ||
        !userLongitude ||
        !destinationLatitude ||
        !destinationLongitude
    )
        return;

    try {
        const timesPromises = markers.map(async (marker) => {
            const responseToUser = await fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${marker.latitude},${marker.longitude}&destination=${userLatitude},${userLongitude}&key=${directionsAPI}`,
            );
            const dataToUser = await responseToUser.json();
            const timeToUser = dataToUser.routes[0].legs[0].duration.value; // Time in seconds

            const responseToDestination = await fetch(
                `https://maps.googleapis.com/maps/api/directions/json?origin=${userLatitude},${userLongitude}&destination=${destinationLatitude},${destinationLongitude}&key=${directionsAPI}`,
            );
            const dataToDestination = await responseToDestination.json();
            const timeToDestination =
                dataToDestination.routes[0].legs[0].duration.value; // Time in seconds

            const totalTime = (timeToUser + timeToDestination) / 60; // Total time in minutes
            const price = (totalTime * 0.5).toFixed(2); // Calculate price based on time

            return {...marker, time: totalTime, price};
        });

        return await Promise.all(timesPromises);
    } catch (error) {
        console.error("Error calculating driver times:", error);
    }
};


---
File: /lib/utils.ts
---

import {Ride} from "@/types/type";

export const sortRides = (rides: Ride[]): Ride[] => {
    const result = rides.sort((a, b) => {
        const dateA = new Date(`${a.created_at}T${a.ride_time}`);
        const dateB = new Date(`${b.created_at}T${b.ride_time}`);
        return dateB.getTime() - dateA.getTime();
    });

    return result.reverse();
};

export function formatTime(minutes: number): string {
    const formattedMinutes = +minutes?.toFixed(0) || 0;

    if (formattedMinutes < 60) {
        return `${minutes} min`;
    } else {
        const hours = Math.floor(formattedMinutes / 60);
        const remainingMinutes = formattedMinutes % 60;
        return `${hours}h ${remainingMinutes}m`;
    }
}

export function formatDate(dateString: string): string {
    const date = new Date(dateString);
    const day = date.getDate();
    const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();

    return `${day < 10 ? "0" + day : day} ${month} ${year}`;
}


---
File: /scripts/reset-project.js
---

#!/usr/bin/env node

/**
 * This script is used to reset the project to a blank state.
 * It moves the /app directory to /app-example and creates a new /app directory with an index.tsx and _layout.tsx file.
 * You can remove the `reset-project` script from package.json and safely delete this file after running it.
 */

const fs = require('fs');
const path = require('path');

const root = process.cwd();
const oldDirPath = path.join(root, 'app');
const newDirPath = path.join(root, 'app-example');
const newAppDirPath = path.join(root, 'app');

const indexContent = `import { Text, View } from "react-native";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Text>Edit app/index.tsx to edit this screen.</Text>
    </View>
  );
}
`;

const layoutContent = `import { Stack } from "expo-router";

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" />
    </Stack>
  );
}
`;

fs.rename(oldDirPath, newDirPath, (error) => {
  if (error) {
    return console.error(`Error renaming directory: ${error}`);
  }
  console.log('/app moved to /app-example.');

  fs.mkdir(newAppDirPath, { recursive: true }, (error) => {
    if (error) {
      return console.error(`Error creating new app directory: ${error}`);
    }
    console.log('New /app directory created.');

    const indexPath = path.join(newAppDirPath, 'index.tsx');
    fs.writeFile(indexPath, indexContent, (error) => {
      if (error) {
        return console.error(`Error creating index.tsx: ${error}`);
      }
      console.log('app/index.tsx created.');

      const layoutPath = path.join(newAppDirPath, '_layout.tsx');
      fs.writeFile(layoutPath, layoutContent, (error) => {
        if (error) {
          return console.error(`Error creating _layout.tsx: ${error}`);
        }
        console.log('app/_layout.tsx created.');
      });
    });
  });
});



---
File: /store/index.ts
---

import { DriverStore, LocationStore, MarkerData } from "@/types/type";
import { create } from "zustand";

export const useLocationStore = create<LocationStore>((set) => ({
    userAddress: null,
    userLatitude: null,
    userLongitude: null,
    destinationAddress: null,
    destinationLatitude: null,
    destinationLongitude: null,
    setUserLocation: ({ 
        latitude, longitude, address 
    }: { 
            latitude : number, longitude : number, address : string 
        }) => {
            set(() => ({
                userLatitude: latitude,
                userLongitude: longitude,
                userAddress: address,
            }));
    }, 
        setDestinationLocation: ({ 
            latitude, longitude, address 
        }: { 
                latitude : number, longitude : number, address : string 
            }) => {
                set(() => ({
                    destinationLatitude: latitude,
                    destinationLongitude: longitude,
                    destinationAddress: address,
                }));
        }, 
}));

export const useDriverStore = create<DriverStore>((set) => ({
    drivers: [] as MarkerData[],
    selectedDriver: null,
    setSelectedDriver: (driverId: number) => 
        set(() => ({ selectedDriver : driverId })),
    setDrivers: (drivers: MarkerData[]) => set(() => ({ drivers: drivers })),
    clearSelectedDriver: () => set (() => ({ selectedDriver: null }))

}))


---
File: /types/image.s.ts
---

declare module "*.png" {
    const value: any;
    export default value;
}

declare module "*.jpg" {
    const value: any;
    export default value;
}

declare module "*.jpeg" {
    const value: any;
    export default value;
}

declare module "*.gif" {
    const value: any;
    export default value;
}

declare module "*.svg" {
    const value: any;
    export default value;
}


---
File: /types/type.d.ts
---

import {TextInputProps, TouchableOpacityProps} from "react-native";

declare interface Driver {
    driver_id: number;
    first_name: string;
    last_name: string;
    profile_image_url: string;
    car_image_url: string;
    car_seats: number;
    rating: number;
}

declare interface MarkerData {
    latitude: number;
    longitude: number;
    id: number;
    title: string;
    profile_image_url: string;
    car_image_url: string;
    car_seats: number;
    rating: number;
    first_name: string;
    last_name: string;
    time?: number;
    price?: string;
}

declare interface MapProps {
    destinationLatitude?: number;
    destinationLongitude?: number;
    onDriverTimesCalculated?: (driversWithTimes: MarkerData[]) => void;
    selectedDriver?: number | null;
    onMapReady?: () => void;
}

declare interface Ride {
    origin_address: string;
    destination_address: string;
    origin_latitude: number;
    origin_longitude: number;
    destination_latitude: number;
    destination_longitude: number;
    ride_time: number;
    fare_price: number;
    payment_status: string;
    driver_id: number;
    user_email: string;
    created_at: string;
    driver: {
        first_name: string;
        last_name: string;
        car_seats: number;
    };
}

declare interface ButtonProps extends TouchableOpacityProps {
    title: string;
    bgVariant?: "primary" | "secondary" | "danger" | "outline" | "success";
    textVariant?: "primary" | "default" | "secondary" | "danger" | "success";
    IconLeft?: React.ComponentType<any>;
    IconRight?: React.ComponentType<any>;
    className?: string;
}

declare interface GoogleInputProps {
    icon?: string;
    initialLocation?: string;
    containerStyle?: string;
    textInputBackgroundColor?: string;
    handlePress: ({
                      latitude,
                      longitude,
                      address,
                  }: {
        latitude: number;
        longitude: number;
        address: string;
    }) => void;
}

declare interface InputFieldProps extends TextInputProps {
    label: string;
    icon?: any;
    secureTextEntry?: boolean;
    labelStyle?: string;
    containerStyle?: string;
    inputStyle?: string;
    iconStyle?: string;
    className?: string;
}

declare interface PaymentProps {
    fullName: string;
    email: string;
    amount: string;
    driverId: number;
    rideTime: number;
}

declare interface LocationStore {
    userLatitude: number | null;
    userLongitude: number | null;
    userAddress: string | null;
    destinationLatitude: number | null;
    destinationLongitude: number | null;
    destinationAddress: string | null;
    setUserLocation: ({
                          latitude,
                          longitude,
                          address,
                      }: {
        latitude: number;
        longitude: number;
        address: string;
    }) => void;
    setDestinationLocation: ({
                                 latitude,
                                 longitude,
                                 address,
                             }: {
        latitude: number;
        longitude: number;
        address: string;
    }) => void;
}

declare interface DriverStore {
    drivers: MarkerData[];
    selectedDriver: number | null;
    setSelectedDriver: (driverId: number) => void;
    setDrivers: (drivers: MarkerData[]) => void;
    clearSelectedDriver: () => void;
}

declare interface DriverCardProps {
    item: MarkerData;
    selected: number;
    setSelected: () => void;
}


---
File: /babel.config.js
---

module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: ["nativewind/babel"],
  };
};



---
File: /nativewind-env.d.ts
---

// <reference types="nativewind/types" />


---
File: /tailwind.config.js
---

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
      extend: {
          fontFamily: {
              Jakarta: ["Jakarta", "sans-serif"],
              JakartaBold: ["Jakarta-Bold", "sans-serif"],
              JakartaExtraBold: ["Jakarta-ExtraBold", "sans-serif"],
              JakartaExtraLight: ["Jakarta-ExtraLight", "sans-serif"],
              JakartaLight: ["Jakarta-Light", "sans-serif"],
              JakartaMedium: ["Jakarta-Medium", "sans-serif"],
              JakartaSemiBold: ["Jakarta-SemiBold", "sans-serif"],
          },
          colors: {
              primary: {
                  100: "#F5F8FF",
                  200: "#EBF4FF",
                  300: "#C3D9FF",
                  400: "#9BBFFF",
                  500: "#0286FF",
                  600: "#6A85E6",
                  700: "#475A99",
                  800: "#364573",
                  900: "#242B4D",
              },
              secondary: {
                  100: "#F8F8F8",
                  200: "#F1F1F1",
                  300: "#D9D9D9",
                  400: "#C2C2C2",
                  500: "#AAAAAA",
                  600: "#999999",
                  700: "#666666",
                  800: "#4D4D4D",
                  900: "#333333",
              },
              success: {
                  100: "#F0FFF4",
                  200: "#C6F6D5",
                  300: "#9AE6B4",
                  400: "#68D391",
                  500: "#38A169",
                  600: "#2F855A",
                  700: "#276749",
                  800: "#22543D",
                  900: "#1C4532",
              },
              danger: {
                  100: "#FFF5F5",
                  200: "#FED7D7",
                  300: "#FEB2B2",
                  400: "#FC8181",
                  500: "#F56565",
                  600: "#E53E3E",
                  700: "#C53030",
                  800: "#9B2C2C",
                  900: "#742A2A",
              },
              warning: {
                  100: "#FFFBEB",
                  200: "#FEF3C7",
                  300: "#FDE68A",
                  400: "#FACC15",
                  500: "#EAB308",
                  600: "#CA8A04",
                  700: "#A16207",
                  800: "#854D0E",
                  900: "#713F12",
              },
              general: {
                  100: "#CED1DD",
                  200: "#858585",
                  300: "#EEEEEE",
                  400: "#0CC25F",
                  500: "#F6F8FA",
                  600: "#E6F3FF",
                  700: "#EBEBEB",
                  800: "#ADADAD",
              },
          },
      },
  },
  plugins: [],
};
