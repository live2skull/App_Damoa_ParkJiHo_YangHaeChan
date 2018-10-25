package com.osam2018.damoa.damoa;

import android.app.AlertDialog;
import android.content.Context;
import android.content.DialogInterface;
import android.content.Intent;
import android.content.SharedPreferences;
import android.graphics.PorterDuff;
import android.graphics.drawable.Drawable;
import android.support.v7.app.ActionBar;
import android.support.v7.app.AppCompatActivity;
import android.os.Bundle;
import android.text.Layout;
import android.text.SpannableString;
import android.text.style.AlignmentSpan;
import android.view.KeyEvent;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.inputmethod.InputMethod;
import android.view.inputmethod.InputMethodManager;
import android.widget.AdapterView;
import android.widget.EditText;
import android.widget.ListView;
import android.widget.TextView;
import android.widget.Toast;

import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

public class MainActivity extends AppCompatActivity {

    private ListView lv;
    private UnitAdapter ua;
    private SharedPreferences sharedPref;
    private EditText searchArmy;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        /***************  액션바 설정 ***************/
        getSupportActionBar().setDisplayOptions(ActionBar.DISPLAY_SHOW_CUSTOM);
        getSupportActionBar().setCustomView(R.layout.title2);

        //부대를 검색할 경우 Search함수 실행합니다.
        searchArmy = (EditText)findViewById(R.id.editTextSearchArmy);
        searchArmy.setOnEditorActionListener(new TextView.OnEditorActionListener() {
            @Override
            public boolean onEditorAction(TextView v, int actionId, KeyEvent event) {
                Search(searchArmy.getText().toString());
                return true;
            }
        });

    }

    /*
     * 부대를 검색하는 함수입니다.
     * 부대검색 후 JSON 형태로 Response를 받아오고
     * JSON Parse를 하여 ListView에 출력합니다.
     */
    private void Search(final String s)
    {
        ua = new UnitAdapter();
        lv = (ListView)findViewById(R.id.listView);
        InputMethodManager imm = (InputMethodManager)getSystemService(Context.INPUT_METHOD_SERVICE);
        imm.hideSoftInputFromWindow(searchArmy.getWindowToken(), 0);
        sharedPref = getSharedPreferences("login", MODE_PRIVATE);

        //세션을 불러옴
        final String session = sharedPref.getString("session", "");

        //부대를 선택할 경우 실행되는 리스너이다.
        lv.setOnItemClickListener(new AdapterView.OnItemClickListener() {
            @Override
            public void onItemClick(AdapterView<?> parent, View view, final int position, long id) {
                Thread thread = new Thread(new Runnable(){
                    @Override
                    public void run(){
                        WRequest wr = new WRequest();
                        wr.SetCookie(session);
                        String res = wr.SendPost("https://damoa.live2skull.net/rooms/join", "room_id=" + ua.GetCode(position));
                        //세션이 사용 가능하다면
                        if(!res.contains("\"result\":false"))
                        {
                            //채팅방을 입장한다.
                            MainActivity.this.runOnUiThread(new Runnable() {
                                public void run() {
                                    Intent intent = new Intent(getApplicationContext(),
                                            chat.class);
                                    startActivity(intent);
                                }
                            });
                        }
                        //세션이 만료되었다면
                        else
                        {
                            MainActivity.this.runOnUiThread(new Runnable() {
                                public void run() {
                                    Toast.makeText(MainActivity.this, "잠시 후 다시 시도해 주세요.", Toast.LENGTH_SHORT).show();
                                }
                            });
                        }
                    }
                });
                thread.start();
            }
        });

        //JSON 포맷으로 가져온 후에 Unit을 생성합니다.
        Thread thread = new Thread(new Runnable(){
            @Override
            public void run(){
                WRequest wr = new WRequest();
                String res = wr.SendPost("https://damoa.live2skull.net/rooms/search", "keyword=" + s);
                try{
                    JSONArray jarray =  new JSONArray(res);
                    ua.Clear();
                    //UnitAdapter에 등록합니다.
                    for(int i = 0; i < jarray.length(); i++)
                    {
                        final JSONObject jobject =  jarray.getJSONObject(i);
                        final String name = jobject.getString("name");
                        final String add = jobject.getString("address");
                        final String code = jobject.getString("room_id");
                        final String url = jobject.getString("mark_url");
                        ua.addItem( name , add, code+"_dep", url, "(출발)");
                        ua.addItem( name, add, code+"_arr", url, "(도착)");
                    }
                }
                catch (JSONException e) {
                }

                MainActivity.this.runOnUiThread(new Runnable() {
                    public void run() {
                        if(ua.getCount() == 0)
                        {
                            AlertDialog alertDialog = new AlertDialog.Builder(MainActivity.this).create();
                            alertDialog.setTitle("검색 실패");
                            alertDialog.setMessage("해당 부대를 찾을 수 없습니다. 검색 키워드를 변경해서 검색해 주십시오.");
                            alertDialog.setButton(AlertDialog.BUTTON_NEUTRAL, "확인",
                                    new DialogInterface.OnClickListener() {
                                        public void onClick(DialogInterface dialog, int which) {
                                            dialog.dismiss();
                                        }
                                    });
                            alertDialog.show();
                        }
                        else
                            lv.setAdapter(ua);
                    }
                });
            }
        });
        thread.start();
        //Json 가져온 후 출력
    }
    @Override
    public boolean onCreateOptionsMenu(Menu menu) {
        getMenuInflater().inflate(R.menu.main_menu, menu);

        //메뉴 아이콘 흰색으로 출력
        Drawable menuitem = menu.getItem(0).getIcon();
        menuitem.mutate();
        menuitem.setColorFilter(getResources().getColor(R.color.white), PorterDuff.Mode.SRC_ATOP);

        return true;
    }

    @Override
    public boolean onOptionsItemSelected(MenuItem item) {
        switch(item.getItemId()) {
            //로그아웃 버튼을 클릭할 경우
            case R.id.logout:
                //세션을 지우고 종료한다.
                sharedPref = getSharedPreferences("login", MODE_PRIVATE);
                //세션을 지우는 스레드 생성
                Thread thread = new Thread(new Runnable() {
                    @Override
                    public void run() {
                        final String session = sharedPref.getString("session", "");
                        WRequest wr = new WRequest();
                        wr.SetCookie(session);
                        wr.SendPost("https://damoa.live2skull.net/users/logout", "");
                    }
                });
                thread.start();
                //기기에 저장된 세션 지움
                SharedPreferences.Editor editor = sharedPref.edit();
                editor.putString("session", "");
                editor.commit();
                finish();
                return (true);
        }
        return(super.onOptionsItemSelected(item));
    }
}
