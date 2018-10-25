package com.osam2018.damoa.damoa;

import android.widget.Toast;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.OutputStreamWriter;
import java.io.PrintWriter;
import java.net.HttpURLConnection;
import java.net.MalformedURLException;
import java.net.URL;

/*
 * Web Request를 위한 클래스입니다.
 * 쿠키 설정을 할 수 있으며
 * Post 방식으로 HTTP Request를 하고 결과값을 리턴합니다.
 */
public class WRequest {

    private String cookie;

    //쿠키를 설정합니다.
    public void SetCookie(String s)
    {
        this.cookie = s;
    }
    //쿠키를 String형태로 리턴합니다.
    public String GetCookie()
    {
        return this.cookie;
    }

    //HTTP Request를 하고, 결과값을 리턴합니다.
    public String SendPost(String strUrl, String body) {
        try {
            //--------------------------
            //   URL 설정하고 접속하기
            //--------------------------
            URL url = new URL(strUrl);
            HttpURLConnection http = (HttpURLConnection) url.openConnection();
            //--------------------------
            //   전송 모드 설정 - 기본적인 설정이다
            //--------------------------
            http.setDefaultUseCaches(false);
            http.setDoInput(true);
            http.setDoOutput(true);
            http.setRequestMethod("POST");
            http.setRequestProperty("cookie", this.cookie);
            http.setRequestProperty("content-type", "application/x-www-form-urlencoded");
            //--------------------------
            //   서버로 값 전송
            //--------------------------
            OutputStreamWriter outStream = new OutputStreamWriter(http.getOutputStream(), "UTF-8");
            PrintWriter writer = new PrintWriter(outStream);
            writer.write(body);
            writer.flush();
            //--------------------------
            //   서버에서 전송받기
            //--------------------------
            InputStreamReader tmp = new InputStreamReader(http.getInputStream(), "UTF-8");

            BufferedReader reader = new BufferedReader(tmp);
            StringBuilder builder = new StringBuilder();
            String str;

            while ((str = reader.readLine()) != null) {
                builder.append(str + "\n");
            }
            final String cookie = http.getHeaderField("set-cookie");
            if(cookie != null) {
                //리턴되는 쿠키가 있다면 쿠키를 설정합니다.
                if (cookie.length() > 10)
                    this.cookie = cookie;
            }
            final String myResult = builder.toString();
            return myResult;
        } catch (MalformedURLException e) {
            return "";
        } catch (IOException e) {
            return "";
        }
    }
}
