package com.osam2018.damoa.damoa;

import android.content.Context;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.AsyncTask;
import android.support.v4.content.ContextCompat;
import android.view.LayoutInflater;
import android.view.View;
import android.view.ViewGroup;
import android.widget.BaseAdapter;
import android.widget.ImageView;
import android.widget.TextView;

import java.io.InputStream;
import java.util.ArrayList;

/*
 * 부대를 ListView에 출력하기 위한 Adapter입니다.
 */

public class UnitAdapter extends BaseAdapter{
    private ArrayList<Unit> mUnits = new ArrayList<>();

    @Override
    public int getCount() {
        return mUnits.size();
    }

    @Override
    public Unit getItem(int position) {
        return mUnits.get(position);
    }

    @Override
    public long getItemId(int position) {
        return 0;
    }

    @Override
    public View getView(final int position, View convertView, ViewGroup parent) {

        final Context context = parent.getContext();

        if (convertView == null) {
            LayoutInflater inflater = (LayoutInflater) context.getSystemService(Context.LAYOUT_INFLATER_SERVICE);
            convertView = inflater.inflate(R.layout.listview_cell, parent, false);
        }

        ImageView iv_img = (ImageView) convertView.findViewById(R.id.iv_img);
        final TextView tv_name = (TextView) convertView.findViewById(R.id.tv_name);
        TextView tv_contents = (TextView) convertView.findViewById(R.id.tv_contents);
        TextView tv_dest = (TextView)convertView.findViewById(R.id.tv_dest);

        final Unit myItem = getItem(position);

        tv_name.setText(myItem.GetName());
        tv_contents.setText(myItem.GetLocation());
        iv_img.setImageDrawable(ContextCompat.getDrawable(context, R.drawable.mark));
        tv_dest.setText(myItem.GetDest());

        new DownloadImageTask(iv_img)
                .execute(myItem.GetURL());
        return convertView;
    }

    /*
     * ImageView에 URL Image를 넣기 위한 클래스입니다.
     */
    private class DownloadImageTask extends AsyncTask<String, Void, Bitmap> {
        ImageView bmImage;

        public DownloadImageTask(ImageView bmImage) {
            this.bmImage = bmImage;
        }

        protected Bitmap doInBackground(String... urls) {
            String urldisplay = urls[0];
            Bitmap mIcon11 = null;
            try {
                InputStream in = new java.net.URL(urldisplay).openStream();
                mIcon11 = BitmapFactory.decodeStream(in);
            } catch (Exception e) {
                e.printStackTrace();
            }
            return mIcon11;
        }

        protected void onPostExecute(Bitmap result) {
            bmImage.setImageBitmap(result);
        }
    }

    public String GetCode(int pos)
    {
        return getItem(pos).GetCode();
    }

    public void addItem(String name, String location, String code, String url, String dest) {
        Unit mUnit = new Unit();
        mUnit.SetName(name);
        mUnit.SetLocation(location);
        mUnit.SetCode(code);
        mUnit.SetURL(url);
        mUnit.SetDest(dest);

        mUnits.add(mUnit);
    }

    public void Clear()
    {
        mUnits.clear();
    }

}
